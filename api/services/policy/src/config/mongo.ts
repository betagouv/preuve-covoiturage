declare function env(key: string, fallback?: string): any;

export const connectionString = env('APP_MONGO_URL');
