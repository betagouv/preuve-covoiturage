declare function env(key: string, fallback?: string): any;

export const collectionName = env('APP_CAMPAIGN_DB', 'campaign_metas');
export const db = env('APP_MONGO_DB');
