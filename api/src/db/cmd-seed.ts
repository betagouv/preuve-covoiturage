import { env_or_fail } from "@/lib/env/index.ts";
import { Migrator } from "../pdc/providers/migration/Migrator.ts";

const migrator = new Migrator(env_or_fail("APP_POSTGRES_URL"), false);
await migrator.up();
await migrator.migrate({ skip: false, flash: false });
await migrator.seed();
await migrator.down();
