import rateLimit, { Store, RateLimit, Message } from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';

type RateLimiterOptions = Partial<{
  store: Store;
  max: number;
  windowMs: number;
  message: string | Buffer | Message;
}>;

export function rateLimiter(opts: RateLimiterOptions = {}): RateLimit {
  console.log('SETUP rateLimiter', process.env.APP_REDIS_URL);
  return rateLimit({
    store: new RedisStore({
      redisURL: process.env.APP_REDIS_URL,
    }),
    windowMs: 5 * 60000,
    max: 100,
    message: {
      status: 429,
      message: 'Too many requests, please try again later',
    },
    ...opts,
  });
}

// shortcut for authentication routes
export function authRateLimiter(opts: RateLimiterOptions = {}): RateLimit {
  return rateLimiter({
    windowMs: 60000,
    max: 5,
    ...opts,
  });
}

// shortcut for api routes
export function apiRateLimiter(opts: RateLimiterOptions = {}): RateLimit {
  return rateLimiter({
    windowMs: 5 * 60000,
    max: 5 * 200,
    ...opts,
  });
}
