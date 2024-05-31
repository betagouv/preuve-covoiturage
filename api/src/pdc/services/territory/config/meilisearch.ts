import { env } from '@ilos/core/index.ts';

export const host = env.or_fail('APP_MEILISEARCH_HOST', 'http://localhost');
export const apiKey = env.or_fail('APP_MEILISEARCH_APIKEY', '');
export const index = env.or_fail('APP_MEILISEARCH_INDEX', 'geo');
export const batchSize = env.or_int('APP_MEILISEARCH_BATCH', 1000);
