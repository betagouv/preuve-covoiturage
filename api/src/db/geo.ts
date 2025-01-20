import { buildMigrator } from "@/etl/buildMigrator.ts";
import { env_or_false } from "@/lib/env/index.ts";
import { logger } from "@/lib/logger/index.ts";
import { FlashGeoSchema } from "@/pdc/providers/seed/FlashGeoSchema.ts";

/**
 * Configure the cache for the geo schema.
 *
 * Requirements:
 * - `pg_dump`
 * - `7z`
 * - Access to the cache bucket (Scaleway: geo-datasets-archives)
 *
 * # Dump and compress the schema + data
 *
 * ```sh
 * pg_dump -Fp -xO -n geo | 7z a -si $(date +%F)_geo_schema.sql.7z
 * sha256sum $(date +%F)_geo_schema.sql.7z | tee $(date +%F)_geo_schema.sql.7z.sha
 * ```
 *
 * # Upload the archive to the cache
 *
 * 1. Upload the archive alongside the sha256sum file to the cache bucket
 *    (geo-datasets-archives) using the web interface
 * 2. Set the visilibity of both files to public
 *
 * # Update the cache configuration below
 */
export async function flashGeoSchema(connectionString: string): Promise<void> {
  if (env_or_false("SKIP_GEO_MIGRATIONS")) {
    logger.warn("Skipping geo migrations");
    return;
  }

  const flash = new FlashGeoSchema({
    connectionString,
    cache: {
      url: "https://geo-datasets-archives.s3.fr-par.scw.cloud/20250120_geo.pgsql.7z",
      sha: "57e3808df9fc77506ab96667f5ab4b072aa012a82d752b9b15e37d8e0ec89424",
    },
  });

  await flash.exec();
}

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
