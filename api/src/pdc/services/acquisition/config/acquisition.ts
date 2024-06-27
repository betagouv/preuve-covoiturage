import { env_or_fail, env_or_int } from "@/lib/env/index.ts";

export const collectionName = env_or_fail("APP_JOURNEY_DB", "journeys");
export const costByKm = 0.558;

export const processing = {
  batchSize: env_or_int("APP_ACQUISITION_PROCESSING_BATCH", 100),
  timeout: env_or_int("APP_ACQUISITION_PROCESSING_TIMEOUT", 10000),
};
