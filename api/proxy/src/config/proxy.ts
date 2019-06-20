declare function env(key: string, fallback?: string): any;

export const appUrl = env('APP_URL', 'nope');
export const apiUrl = env('API_URL', 'nope');
export const jwtSecret = env('APP_JWT_SECRET', 'Set me in .env file!!!');
export const session = {
  secret: env('APP_SESSION_SECRET', 'Set me in .env file!!!'),
  name: env('APP_SESSION_NAME', 'pdc-session'),
};
export const rpc = {
  open: env('APP_ENV', null) !== 'production',
  endpoint: env('APP_RPC_ENDPOINT', '/rpc'),
};

export const cors = env('APP_ENV', null) === 'review' ? '*' : appUrl;

// exports.default = {
//   environment: process.env,
//   PORT: getHttpPost(process.env.PORT),
//   mongoDatabase: mongoConfig.database,
//   mongoUrl,
//   redisUrl: process.env.REDIS_URL || 'redis://redis:6379',
//   redisObject: getRedisConfig(process.env.REDIS_URL || 'redis://redis:6379'),
//   jwtSecret: process.env.JWT_SECRET || 'Set me in .env file!!!',
//   sessionSecret: process.env.SESSION_SECRET || 'Set me in .env file!!!',
//   importMaxFileSizeMb: 5,
// };
