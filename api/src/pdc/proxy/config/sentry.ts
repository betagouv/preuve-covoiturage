import { env_or_fail } from "@/lib/env/index.ts";

export const dsn = env_or_fail("APP_SENTRY_DSN", "");
export const environment = env_or_fail(
  "APP_SENTRY_ENV",
  env_or_fail("NODE_ENV", "local"),
);
export const version = env_or_fail("APP_VERSION", new Date().toISOString());
