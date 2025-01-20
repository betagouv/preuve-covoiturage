import { env_or_fail, env_or_false } from "@/lib/env/index.ts";
import { Migrator } from "@/pdc/providers/seed/Migrator.ts";

const migrator = new Migrator(env_or_fail("APP_POSTGRES_URL"), false);
await migrator.up();
await migrator.migrate({
  skip: env_or_false("SKIP_ALL_MIGRATIONS"),
  flash: !env_or_false("SKIP_FLASH_DATA"),
  skipGeo: env_or_false("SKIP_GEO_MIGRATIONS"),
});
await migrator.down();
