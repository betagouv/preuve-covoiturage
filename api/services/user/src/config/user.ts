declare function env(key: string, fallback?: string): any;

export const collectionName = env('APP_USER_DB', 'users');
export const db = env('APP_MONGO_DB');
export const defaultLimit = 1000;
export const defaultSkip = 0;
export const status = {
  active: 'active',
  notActive: 'notActive',
};
export const tokenExpiration = {
  emailConfirm: 86400, // 1 day in seconds
  passwordReset: 86400, // 1 day in seconds
};
