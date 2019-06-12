declare function env(key: string, fallback?: string): any;

export const collectionName = env('APP_OPERATOR_DB', 'operator');
