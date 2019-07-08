declare function env(key: string, fallback?: string): any;

export const collectionName = env('APP_TERRITORY_DB', 'territories');
export const db = env('APP_MONGO_DB');
