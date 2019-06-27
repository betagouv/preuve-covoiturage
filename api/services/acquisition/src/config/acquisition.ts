declare function env(key: string, fallback?: string): any;

export const collectionName = env('APP_JOURNEY_DB', 'journeys');
export const db = env('APP_MONGO_DB');
export const costByKm = 0.558;
