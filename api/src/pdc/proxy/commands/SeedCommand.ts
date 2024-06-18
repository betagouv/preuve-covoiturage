import { process } from "@/deps.ts";
import {
  command,
  CommandInterface,
  CommandOptionType,
} from "@/ilos/common/index.ts";

@command()
export class SeedCommand implements CommandInterface {
  static readonly signature: string = "seed";
  static readonly description: string = "Seed database";
  static readonly options: CommandOptionType[] = [
    {
      signature: "--skip-migration",
      description: "skip migration before seeding",
      default: false,
    },
    {
      signature: "-u, --database-uri <uri>",
      description: "Postgres connection string",
      default: process.env.APP_POSTGRES_URL,
    },
  ];

  public async call(options): Promise<string> {
    // const db = new Migrator(options.databaseUri, false);
    // await db.up();
    // if (!options.skipMigration) {
    //   await db.migrate();
    // }
    // await db.seed();
    // await db.down();
    // console.log("all is done");
    return "toto";
  }
}
