import { env_or_fail } from "@/lib/env/index.ts";

export const enabled =
  env_or_fail("APP_USER_REGISTRATION_ENABLED", env_or_fail("CI", "false")) ===
    "true";
