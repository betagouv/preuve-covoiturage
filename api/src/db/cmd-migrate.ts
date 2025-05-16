import { env_or_fail, env_or_false } from "@/lib/env/index.ts";
import { LegacyMigrator } from "../pdc/providers/migration/LegacyMigrator.ts";

/**
 * Migrate command.
 *
 * Run SQL migrations from the migrations folder.
 * Flash data from remote cache.
 */
const migrator = new LegacyMigrator(env_or_fail("APP_POSTGRES_URL"), false);
await migrator.up();
await migrator.migrate({
  skip: env_or_false("MIGRATIONS_SKIP_ALL"),
  flash: !env_or_false("MIGRATIONS_SKIP_FLASH"),
  cache: {
    url: "https://geo-datasets-archives.s3.fr-par.scw.cloud/20250120_data.pgsql.7z",
    sha: "9fbbd21fe84b77bac0536c270a2365c9a721ab067f8c9ccc1103e4b51a0432bf",
  },
});
await migrator.down();
