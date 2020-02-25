import { env } from '@ilos/core';

export const collectionName = env('APP_OPERATOR_DB', 'operators');
export const db = env('APP_MONGO_DB');
