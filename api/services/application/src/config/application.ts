declare function env(key: string, fallback?: any): any;

/**
 * Mongo collection to use for storing data
 */
export const collectionName = env('APP_APPLICATION_DB', 'applications');
export const db = env('APP_MONGO_DB');
