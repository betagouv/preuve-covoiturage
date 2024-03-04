import { env } from '@ilos/core';

export const collectionName = env.or_fail('APP_JOURNEY_DB', 'journeys');
export const costByKm = 0.558;

export const processing = {
  batchSize: env.or_int('APP_ACQUISITION_PROCESSING_BATCH', 100),
  timeout: env.or_int('APP_ACQUISITION_PROCESSING_TIMEOUT', 10000),
};
