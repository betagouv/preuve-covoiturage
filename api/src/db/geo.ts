import { buildMigrator } from "@/etl/buildMigrator.ts";
import { env_or_false } from "@/lib/env/index.ts";
import { logger } from "@/lib/logger/index.ts";

/**
 * Migrate geo schema from source.
 *
 * Using the ETL, the migrator will download a number of datasets and import
 * their data into the geo.perimeters table
 *
 * @see api/src/etl/docs for more information
 */
export async function migrateGeoSchema(config: string) {
  if (env_or_false("SKIP_GEO_MIGRATIONS")) {
    logger.warn("Skipping geo migrations");
    return;
  }

  const migrator = buildMigrator({
    pool: {
      connectionString: config,
    },
    app: {
      targetSchema: "geo",
      datasets: new Set(),
    },
  });

  await migrator.prepare();
  await migrator.run();
  await migrator.cleanup();
}
