import { env_or_fail, env_or_int } from "@/lib/env/index.ts";

export const host = env_or_fail("APP_MEILISEARCH_HOST", "http://localhost");
export const apiKey = env_or_fail("APP_MEILISEARCH_APIKEY", "");
export const index = env_or_fail("APP_MEILISEARCH_INDEX", "geo");
export const batchSize = env_or_int("APP_MEILISEARCH_BATCH", 1000);
