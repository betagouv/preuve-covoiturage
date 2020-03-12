import { env } from '@ilos/core';

export const connectionString = env('APP_REDIS_URL');
