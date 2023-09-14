import { env } from '@ilos/core';

export const dsn = env.or_fail('APP_SENTRY_DSN', '');
export const environment = env.or_fail('APP_SENTRY_ENV', env.or_fail('NODE_ENV', 'local'));

// scalingo specific. Use APP_VERSION if you have one
export const version = env.or_fail('CONTAINER_VERSION', new Date().toISOString());
