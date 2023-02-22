import { env } from '@ilos/core';

export const batchSize = parseInt(env('APP_FRAUDCHECK_PROCESSING_BATCH', '100') as string);
export const timeout = parseInt(env('APP_FRAUDCHECK_PROCESSING_TIMEOUT', '60000') as string);
