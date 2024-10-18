import { command, CommandInterface } from "@/ilos/common/index.ts";
import { env } from "@/lib/env/index.ts";
import { Migrator } from "@/pdc/providers/seed/index.ts";

@command({
  signature: "seed",
  description: "Seed database",
  options: [
    {
      signature: "--skip-migration",
      description: "skip migration before seeding",
      default: false,
    },
    {
      signature: "-u, --database-uri <uri>",
      description: "Postgres connection string",
      default: env("APP_POSTGRES_URL"),
    },
  ],
})
export class SeedCommand implements CommandInterface {
  public async call(options): Promise<void> {
    const db = new Migrator(options.databaseUri, false);
    await db.up();
    if (!options.skipMigration) {
      await db.migrate();
    }
    await db.seed();
    await db.down();
  }
}
