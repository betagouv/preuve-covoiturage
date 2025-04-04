import { env_or_fail, env_or_int } from "@/lib/env/index.ts";

export const url = env_or_fail(
  "APP_INSEE_API_URL",
  "https://api.insee.fr/api-sirene/3.11",
);
export const token = env_or_fail("APP_INSEE_API_KEY", "");
export const timeout = env_or_int("APP_INSEE_TIMEOUT", 5000);
