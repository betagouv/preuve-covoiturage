import { env } from '@ilos/core';

export const postgres = {
  connectionString: env('APP_POSTGRES_URL'),
};
