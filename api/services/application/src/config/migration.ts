declare function env(key: string, fallback?: string | number): any;

export const collection = 'migrations';
export const db = env('APP_MONGO_DB');
