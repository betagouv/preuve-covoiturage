import { env } from '@ilos/core';

export const baseURL = 'https://www.data.gouv.fr/api/1/';

export const apiKeyHeader = 'X-API-KEY';
export const apiKey = env('APP_DATAGOUV_KEY');

export const datasetSlug = env('APP_DATAGOUV_DATASET');
