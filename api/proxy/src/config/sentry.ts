import { env } from '@ilos/core';

export const dsn = env('APP_SENTRY_DSN', null);
export const environment = env('APP_SENTRY_ENV', env('NODE_ENV', 'local'));
// eslint-disable-next-line @typescript-eslint/no-var-requires
export const version = env('APP_VERSION', require('child_process').execSync('git describe --tags').toString().trim());
