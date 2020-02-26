import { env } from '@ilos/core';

export const collection = 'migrations';
export const db = env('APP_MONGO_DB');
