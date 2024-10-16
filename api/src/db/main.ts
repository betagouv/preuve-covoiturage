import { env_or_fail } from "@/lib/env/index.ts";
import { migrate } from "./index.ts";

migrate(env_or_fail("APP_POSTGRES_URL"));
