declare function env(key: string, fallback?: string): any;

export const collectionName = env('APP_OPERATOR_DB', 'operators');
export const db = env('APP_MONGO_DB');
