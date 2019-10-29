declare function env(key: string, fallback?: string | number): any;

export const connectionString = env('APP_REDIS_URL');
