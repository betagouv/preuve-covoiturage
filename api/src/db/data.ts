import { FlashDBData } from "../pdc/providers/seed/FlashDBData.ts";

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
export async function flashData(connectionString: string): Promise<void> {
  const flash = new FlashDBData({
    connectionString,
    cache: {
      url: "https://geo-datasets-archives.s3.fr-par.scw.cloud/20250120_geo.pgsql.7z",
      sha: "57e3808df9fc77506ab96667f5ab4b072aa012a82d752b9b15e37d8e0ec89424",
    },
  });

  await flash.exec();
}
