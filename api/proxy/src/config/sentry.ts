import { env } from '@ilos/core';

export const dsn = env.or_fail('APP_SENTRY_DSN', '');
export const environment = env.or_fail('APP_SENTRY_ENV', env.or_fail('NODE_ENV', 'local'));
export const version = env.or_fail('APP_VERSION', new Date().toISOString());
