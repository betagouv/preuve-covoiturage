import {
  command,
  CommandInterface,
  CommandOptionType,
} from "@/ilos/common/index.ts";
import { PostgresConnection } from "@/ilos/connection-postgres/index.ts";
import { CryptoProviderInterfaceResolver } from "@/pdc/providers/crypto/index.ts";
import { process } from "@/deps.ts";

import { ParamsInterface } from "@/shared/user/create.contract.ts";

interface CreateUserInterface extends ParamsInterface {
  password: string;
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
  ];

  static readonly signature: string = "seed:users";
  static readonly description: string = "Seed local users";
  static readonly options: CommandOptionType[] = [
    {
      signature: "-u, --database-uri <uri>",
      description: "Postgres connection string",
      default: process.env.APP_POSTGRES_URL,
    },
  ];

  constructor(private crypto: CryptoProviderInterfaceResolver) {}

  public async call(options): Promise<string> {
    if (["local", "dev", "test", "ci"].indexOf(process.env.NODE_ENV) === -1) {
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
      } = this.users.shift();

      try {
        const insert = await pgClient.query<any>({
          text: `
              INSERT INTO auth.users
              ( email, password, firstname, lastname, role, operator_id, territory_id, status )
              VALUES ( $1, $2, $3, $4, $5, $6, $7, $8 )
            `,
          values: [
            email,
            await this.crypto.cryptPassword(password),
            firstname,
            lastname,
            role,
            operator_id,
            territory_id,
            "active",
          ],
        });

        if (insert.rowCount !== 1) {
          console.info(`--- Failed to insert ${email}`);
        }

        console.info(`+++ Inserted ${email}`);
      } catch (e) {
        console.error(`--- Failed to insert ${email}:\n\t${e.message}`);
      }
    }

    return "Users seeded!";
  }
}
