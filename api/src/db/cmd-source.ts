import { migrateGeoSchema } from "@/db/geo.ts";
import { env_or_fail } from "@/lib/env/index.ts";

await migrateGeoSchema(env_or_fail("APP_POSTGRES_URL"));
