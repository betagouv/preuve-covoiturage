import { env } from '@ilos/core';

export const db = env('APP_MIGRATIONS_DB', env('APP_MONGO_DB'));
