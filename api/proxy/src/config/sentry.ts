declare function env(key: string, fallback?: string): any;

export const dsn = env('SENTRY_DSN', null);
export const environment = env('SENTRY_ENV', env('APP_ENV', 'local'));
export const version = env('APP_VERSION', '0.0.1');
