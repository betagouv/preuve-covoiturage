import { env_or_fail, env_or_false } from "@/lib/env/index.ts";
import { Migrator } from "../pdc/providers/migration/Migrator.ts";

const migrator = new Migrator(env_or_fail("APP_POSTGRES_URL"), false);
await migrator.up();
await migrator.migrate({
  skip: env_or_false("SKIP_ALL_MIGRATIONS"),
  flash: !env_or_false("SKIP_FLASH_DATA"),
  cache: {
    url: "https://geo-datasets-archives.s3.fr-par.scw.cloud/20250120_data.pgsql.7z",
    sha: "9fbbd21fe84b77bac0536c270a2365c9a721ab067f8c9ccc1103e4b51a0432bf",
  },
});
await migrator.down();
