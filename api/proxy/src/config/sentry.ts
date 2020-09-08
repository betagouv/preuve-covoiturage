import { env } from '@ilos/core';

export const dsn = env('APP_SENTRY_DSN', null);
export const environment = env('APP_SENTRY_ENV', env('NODE_ENV', 'local'));

// scalingo specific. Use APP_VERSION if you have one
export const version = env('CONTAINER_VERSION', new Date().toISOString());
