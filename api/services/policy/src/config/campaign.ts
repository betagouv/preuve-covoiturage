declare function env(key: string, fallback?: string): any;

export const collectionName = env('APP_CAMPAIGN_DB', 'campaigns');
export const db = env('APP_MONGO_DB');
