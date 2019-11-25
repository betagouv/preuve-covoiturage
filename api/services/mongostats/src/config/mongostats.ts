declare function env(key: string, fallback?: string): any;

export const collectionName = env('APP_MONGOSTATS_DB', 'statistics');
export const db = env('APP_MONGO_DB');
