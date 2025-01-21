import { buildMigrator } from "@/db/geo/buildMigrator.ts";
import { env_or_fail } from "@/lib/env/index.ts";

/**
 * Source geo perimeters command
 *
 * Download and import geo perimeters from external datasets defined
 * in the ./geo directory.
 */
const connectionString = env_or_fail("APP_POSTGRES_URL");
const migrator = buildMigrator({
  pool: { connectionString },
  app: { targetSchema: "geo", datasets: new Set() },
});

await migrator.prepare();
await migrator.run();
await migrator.cleanup();
