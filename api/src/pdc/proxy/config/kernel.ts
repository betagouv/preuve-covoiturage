import { env_or_int } from "@/lib/env/index.ts";

export const timeout = env_or_int("APP_REQUEST_TIMEOUT", 5000);
