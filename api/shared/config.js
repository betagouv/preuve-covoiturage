const url = require('url');

function getRedisConfig(redisUrl) {
  const redisConfig = url.parse(redisUrl);
  return {
    host: redisConfig.hostname || 'localhost',
    port: Number(redisConfig.port || 6379),
    database: (redisConfig.pathname || '/0').substr(1) || '0',
    password: redisConfig.auth ? redisConfig.auth.split(':')[1] : undefined,
  };
}

function getMongoConfig(mongoUrl) {
  const mongoConfig = url.parse(mongoUrl);
  return {
    host: mongoConfig.hostname || 'localhost',
    port: Number(mongoConfig.port || 6379),
    database: mongoConfig.pathname.substr(1) || `pdc-${process.env.NODE_ENV}`,
    password: mongoConfig.auth ? mongoConfig.auth.split(':')[1] : undefined,
  };
}

function getHttpPost(port, def = 8080) {
  if (process.env.NODE_ENV === 'test') {
    return 0;
  }

  return port || def;
}

const mongoUrl = process.env.MONGO_URL || `mongodb://mongo:mongo@mongo/pdc-${process.env.NODE_ENV}?authSource=admin`;
const mongoConfig = getMongoConfig(mongoUrl);

/**
 * System configuration
 * - Application exposed port
 * - Mongo
 * - Redis
 * - JWT secret key
 * - Session secret key
 */
module.exports = {
  environment: process.env,
  PORT: getHttpPost(process.env.PORT),
  mongoDatabase: mongoConfig.database,
  mongoUrl,
  redisUrl: process.env.REDIS_URL || 'redis://redis:6379',
  redisObject: getRedisConfig(process.env.REDIS_URL || 'redis://redis:6379'),
  jwtSecret: process.env.JWT_SECRET || 'Set me in .env file!!!',
  sessionSecret: process.env.SESSION_SECRET || 'Set me in .env file!!!',
  importMaxFileSizeMb: 5,
};
