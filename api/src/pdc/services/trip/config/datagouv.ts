import { env } from '@/ilos/core/index.ts';

export const apiKeyHeader = 'X-API-KEY';
export const baseURL = env.or_fail('APP_DATAGOUV_URL');
export const apiKey = env.or_fail('APP_DATAGOUV_KEY');

export const datasetSlug = env.or_fail(
  'APP_DATAGOUV_DATASET',
  'trajets-realises-en-covoiturage-registre-de-preuve-de-covoiturage',
);
