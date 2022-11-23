import { env } from '@ilos/core';

export const redis = {
  connectionString: env('APP_REDIS_URL'),
};

export const postgres = {
  connectionString: env('APP_POSTGRES_URL'),
};
