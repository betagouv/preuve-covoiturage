import { env } from '@ilos/core';

export const collectionName = env.or_fail('APP_JOURNEY_DB', 'journeys');
export const costByKm = 0.558;

// 0: no time limit
// default: 5 days
export const timeLimit = env.or_fail('APP_ACQUISITION_TIMELIMIT', '5');

export const processing = {
  batchSize: env.or_int('APP_ACQUISITION_PROCESSING_BATCH', 100),
  timeout: env.or_int('APP_ACQUISITION_PROCESSING_TIMEOUT', 10000),
};
