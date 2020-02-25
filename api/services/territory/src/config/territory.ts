import { env } from '@ilos/core';

export const collectionName = env('APP_TERRITORY_DB', 'territories');
export const db = env('APP_MONGO_DB');
