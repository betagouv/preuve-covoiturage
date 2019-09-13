declare function env(key: string, fallback?: string): any;

export const redis = {
  connectionString: env('APP_REDIS_URL'),
};
