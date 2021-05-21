import rateLimit, { Store, RateLimit } from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { env } from '@ilos/core';

type RateLimiterOptions = Partial<{
  store: Store;
  max: number;
  windowMs: number;
}>;

const minute = 60000;

export function rateLimiter(opts: RateLimiterOptions = {}, prefix = 'rl'): RateLimit {
  const options = {
    store: new RedisStore({ prefix, redisURL: process.env.APP_REDIS_URL }),
    windowMs: 5 * minute,
    max: 100,
    handler(req, res) {
      res.status(429).json({
        error: { code: 429, message: 'Too many requests', ...req.rateLimit },
      });
    },
    ...opts,
  };

  const factor = parseFloat(String(env('APP_RATE_LIMIT_MAX_FACTOR', 1)));
  options.max = options.max * (typeof factor === 'number' && !isNaN(factor) ? factor : 1);

  return rateLimit(options);
}

// shortcut for authentication routes
export function loginRateLimiter(opts: RateLimiterOptions = {}): RateLimit {
  return rateLimiter({ windowMs: 1 * minute, max: 5, ...opts }, 'rl-login');
}

export function authRateLimiter(opts: RateLimiterOptions = {}): RateLimit {
  return rateLimiter({ windowMs: 1 * minute, max: 100, ...opts }, 'rl-auth');
}

// shortcut for api routes
export function apiRateLimiter(opts: RateLimiterOptions = {}): RateLimit {
  return rateLimiter({ windowMs: 5 * minute, max: 2000, ...opts }, 'rl-api');
}

// shortcut for /v2/journeys route
export function acquisitionRateLimiter(opts: RateLimiterOptions = {}): RateLimit {
  return rateLimiter({ windowMs: 1 * minute, max: 20000, ...opts }, 'rl-acquisition');
}

// shortcut for /monitoring/honor route
export function monHonorCertificateRateLimiter(opts: RateLimiterOptions = {}): RateLimit {
  return rateLimiter({ windowMs: 1 * minute, max: 10, ...opts }, 'rl-monitoring-cert');
}

// shortcut for /contactform route
export function contactformRateLimiter(opts: RateLimiterOptions = {}): RateLimit {
  return rateLimiter({ windowMs: 1 * minute, max: 3, ...opts }, 'rl-contactform');
}
