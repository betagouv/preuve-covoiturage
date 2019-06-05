declare function env(key: string, fallback?: string): any;

export const appUrl = env('APP_URL', 'nope');
export const apiUrl = env('API_URL', 'nope');
export const jwtSecret = env('JWT_SECRET', 'Set me in .env file!!!');
export const sessionSecret = env('SESSION_SECRET', 'Set me in .env file!!!');
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
