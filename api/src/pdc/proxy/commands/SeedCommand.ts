import { command, CommandInterface } from "@/ilos/common/index.ts";
import { env, env_or_false } from "@/lib/env/index.ts";
import { Migrator } from "@/pdc/providers/seed/index.ts";

type Options = {
  noFlashGeoSchema: boolean;
  skipMigrations: boolean;
  databaseUri: string;
};

@command({
  signature: "seed",
  description: "Seed database",
  options: [
    {
      signature: "--no-flash-geo-schema",
      description: "migrate geo schema from source, not cache",
      default: env_or_false("SKIP_FLASH_GEO_SCHEMA"),
    },
    {
      signature: "--skip-migrations",
      description: "skip all migrations before seeding",
      default: env_or_false("SKIP_ALL_MIGRATIONS"),
    },
    {
      signature: "-u, --database-uri <uri>",
      description: "Postgres connection string",
      default: env("APP_POSTGRES_URL"),
    },
  ],
})
export class SeedCommand implements CommandInterface {
  public async call(options: Options): Promise<void> {
    const db = new Migrator(options.databaseUri, false);
    await db.up();

    await db.migrate({
      skip: options.skipMigrations,
      flash: !options.noFlashGeoSchema,
    });
    await db.seed();

    await db.down();
  }
}
