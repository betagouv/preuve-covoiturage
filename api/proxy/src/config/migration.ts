declare function env(key: string, fallback?: string): any;

export const db = env('APP_MIGRATIONS_DB', env('APP_MONGO_DB'));
