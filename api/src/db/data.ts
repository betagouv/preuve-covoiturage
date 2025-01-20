import { FlashDBData } from "@/pdc/providers/seed/FlashDBData.ts";

/**
 * Configure the cache for the data.
 *
 * Requirements:
 * - `pg_dump`
 * - `7z`
 * - Access to the cache bucket (Scaleway: geo-datasets-archives)
 *
 * # Dump and compress the schema + data
 *
 * ```sh
 * pg_dump -Fp -xO -a -n geo | 7z a -si $(date +%F)_data.sql.7z
 * sha256sum $(date +%F)_data.sql.7z | tee $(date +%F)_data.sql.7z.sha
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
      url: "https://geo-datasets-archives.s3.fr-par.scw.cloud/20250120_data.pgsql.7z",
      sha: "9fbbd21fe84b77bac0536c270a2365c9a721ab067f8c9ccc1103e4b51a0432bf",
    },
  });

  await flash.exec();
}
