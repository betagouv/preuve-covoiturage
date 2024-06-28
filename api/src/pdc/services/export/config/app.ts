import { env_or_fail } from "@/lib/env/index.ts";

export const environment = env_or_fail("APP_ENV", "local");
