declare function env(key: string, fallback?: string): any;

export const collectionName = env('APP_TRIP_DB', 'trips');
export const db = env('APP_MONGO_DB');
