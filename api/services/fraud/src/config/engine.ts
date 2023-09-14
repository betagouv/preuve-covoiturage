import { env } from '@ilos/core';

export const batchSize = env.or_int('APP_FRAUDCHECK_PROCESSING_BATCH', 100);
export const timeout = env.or_int('APP_FRAUDCHECK_PROCESSING_TIMEOUT', 60000);
