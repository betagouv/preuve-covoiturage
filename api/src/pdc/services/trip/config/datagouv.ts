import { env_or_fail } from "@/lib/env/index.ts";

export const apiKeyHeader = "X-API-KEY";
export const baseURL = env_or_fail("APP_DATAGOUV_URL");
export const apiKey = env_or_fail("APP_DATAGOUV_KEY");

export const datasetSlug = env_or_fail(
  "APP_DATAGOUV_DATASET",
  "trajets-realises-en-covoiturage-registre-de-preuve-de-covoiturage",
);
