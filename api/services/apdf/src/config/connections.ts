import { env } from '@ilos/core';

export const postgres = {
  connectionString: env('APP_POSTGRES_URL'),
};

export const redis = {
  connectionString: env('APP_REDIS_URL'),
};
