import {
  command,
  CommandInterface,
  CommandOptionType,
} from "@/ilos/common/index.ts";
import { PostgresConnection } from "@/ilos/connection-postgres/index.ts";

import { bcrypt_hash } from "@/lib/crypto/index.ts";
import { env, env_or_default } from "@/lib/env/index.ts";
import { logger } from "@/lib/logger/index.ts";
import { ParamsInterface } from "@/shared/user/create.contract.ts";

interface CreateUserInterface extends ParamsInterface {
  password: string;
}

interface Options {
  databaseUri: string;
}

@command()
export class SeedUsersCommand implements CommandInterface {
  private readonly users: CreateUserInterface[] = [
    {
      email: "admin@example.com",
      firstname: "Admin",
      lastname: "Registry",
      password: "admin1234",
      role: "registry.admin",
    },
    {
      email: "operator@example.com",
      firstname: "Admin",
      lastname: "Operator",
      password: "admin1234",
      role: "operator.admin",
      operator_id: 1,
    },
    {
      email: "territory@example.com",
      firstname: "Territory",
      lastname: "Registry",
      password: "admin1234",
      role: "territory.admin",
      territory_id: 1,
    },
  ];

  static readonly signature: string = "seed:users";
  static readonly description: string = "Seed local users";
  static readonly options: CommandOptionType[] = [
    {
      signature: "-u, --database-uri <uri>",
      description: "Postgres connection string",
      default: env("APP_POSTGRES_URL"),
    },
  ];

  constructor() {}

  public async call(options: Options): Promise<string> {
    const env = env_or_default("NODE_ENV", "");
    if (["local", "dev", "test", "ci"].indexOf(env) === -1) {
      throw new Error("Cannot seed users in this environment");
    }

    const pgConnection = new PostgresConnection({
      connectionString: options.databaseUri,
    });
    await pgConnection.up();
    const pgClient = pgConnection.getClient();

    while (this.users.length > 0) {
      const {
        email,
        password,
        firstname,
        lastname,
        role,
        operator_id,
        territory_id,
      } = this.users.shift()!;

      try {
        const insert = await pgClient.query({
          text: `
            INSERT INTO auth.users
            ( email, password, firstname, lastname, role, operator_id, territory_id, status )
            VALUES ( $1, $2, $3, $4, $5, $6, $7, $8 )
            ON CONFLICT ( email ) DO NOTHING
          `,
          values: [
            email,
            await bcrypt_hash(password),
            firstname,
            lastname,
            role,
            operator_id,
            territory_id,
            "active",
          ],
        });

        if (insert.rowCount !== 1) {
          logger.info(`--- Failed to insert ${email}`);
        }

        if ("operator_id" in insert || "territory_id" in insert) {
          logger.warn(
            "operator_id or territory_id are set to 1. Please change them.",
          );
        }

        logger.info(`+++ Inserted ${email}`);
      } catch (e) {
        logger.error(`--- Failed to insert ${email}:\n\t${e.message}`);
      }
    }

    return "Users seeded!";
  }
}
