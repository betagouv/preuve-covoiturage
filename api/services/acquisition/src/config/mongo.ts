declare function env(key: string, fallback?: string): any;

export const url = env('APP_MONGO_URL');
export const db = env('APP_MONGO_DB');
