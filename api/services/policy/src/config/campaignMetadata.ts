import { env } from '@ilos/core';

export const collectionName = env('APP_CAMPAIGN_DB', 'campaign_metas');
export const db = env('APP_MONGO_DB');
