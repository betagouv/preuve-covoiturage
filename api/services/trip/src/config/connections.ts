declare function env(key: string, fallback?: string): any;

export const mongo = {
  connectionString: env('APP_MONGO_URL'),
};

export const redis = {
  connectionString: env('APP_REDIS_URL'),
};

export const postgres = {
  connectionString: env('APP_POSTGRES_URL'),
};
