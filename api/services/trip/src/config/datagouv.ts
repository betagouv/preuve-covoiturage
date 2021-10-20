import { env } from '@ilos/core';

export const apiKeyHeader = 'X-API-KEY';
export const baseURL = env('APP_DATAGOUV_URL');
export const apiKey = env('APP_DATAGOUV_KEY');

export const datasetSlug = env(
  'APP_DATAGOUV_DATASET',
  'trajets-realises-en-covoiturage-registre-de-preuve-de-covoiturage',
);
