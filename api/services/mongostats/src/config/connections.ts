declare function env(key: string, fallback?: string): any;

export const mongo = {
  connectionString: env('APP_MONGO_URL'),
};
