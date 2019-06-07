declare function env(key: string, fallback?: string): any;

export const collectionName = env('APP_USER_DB', 'user');
export const defaultLimit = 1000;
export const defaultSkip = 0;
