declare function env(key: string, fallback?: string): any;

export const postgres = {
  connectionString: env('APP_MONGO_URL'),
};
