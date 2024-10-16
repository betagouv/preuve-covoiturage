import {
  rateLimit,
  RateLimiterOptions,
  RateLimitRedisStore,
  RateLimitRequestHandler,
  Redis as RedisClient,
  Request,
  Response,
} from "@/deps.ts";
import { env_or_fail } from "@/lib/env/index.ts";
import { config } from "../config/index.ts";

const minute = 60000;

export function rateLimiter(
  opts: Partial<RateLimiterOptions> = {},
  prefix = "rl",
): RateLimitRequestHandler {
  const redisConfig = config.connections.redis;
  const client = new RedisClient(redisConfig);
  const options = {
    store: new RateLimitRedisStore({
      prefix,
      // @ts-expect-error - Known issue: the `call` function is not present in @types/ioredis
      sendCommand: (...args: string[]) => client.call(...args),
    }),
    windowMs: 5 * minute,
    max: 100,
    handler(req: Request, res: Response) {
      res.status(429).json({
        error: { code: 429, message: "Too many requests" },
      });
    },
    ...opts,
  };

  const factor = parseFloat(env_or_fail("APP_RATE_LIMIT_MAX_FACTOR", "1"));
  options.max = Number(options.max) *
    (typeof factor === "number" && !isNaN(factor) ? factor : 1);

  return rateLimit(options);
}

// shortcut for authentication routes
export function loginRateLimiter(
  opts: Partial<RateLimiterOptions> = {},
): RateLimitRequestHandler {
  return rateLimiter({ windowMs: 1 * minute, max: 5, ...opts }, "rl-login");
}

export function authRateLimiter(
  opts: Partial<RateLimiterOptions> = {},
): RateLimitRequestHandler {
  return rateLimiter({ windowMs: 1 * minute, max: 100, ...opts }, "rl-auth");
}

// shortcut for api routes
export function apiRateLimiter(
  opts: Partial<RateLimiterOptions> = {},
): RateLimitRequestHandler {
  return rateLimiter({ windowMs: 5 * minute, max: 2000, ...opts }, "rl-api");
}

// shortcut for acquisition route
export function acquisitionRateLimiter(
  opts: Partial<RateLimiterOptions> = {},
): RateLimitRequestHandler {
  return rateLimiter(
    { windowMs: 1 * minute, max: 20000, ...opts },
    "rl-acquisition",
  );
}

// shortcut for cee route
export function ceeRateLimiter(
  opts: Partial<RateLimiterOptions> = {},
): RateLimitRequestHandler {
  return rateLimiter({ windowMs: 1 * minute, max: 20000, ...opts }, "rl-cee");
}

// shortcut for journey status route
export function checkRateLimiter(
  opts: Partial<RateLimiterOptions> = {},
): RateLimitRequestHandler {
  return rateLimiter(
    { windowMs: 1 * minute, max: 2000, ...opts },
    "rl-acquisition-check",
  );
}

// shortcut for /monitoring/honor route
export function monHonorCertificateRateLimiter(
  opts: Partial<RateLimiterOptions> = {},
): RateLimitRequestHandler {
  return rateLimiter(
    { windowMs: 1 * minute, max: 10, ...opts },
    "rl-monitoring-cert",
  );
}

// shortcut for /contactform route
export function contactformRateLimiter(
  opts: Partial<RateLimiterOptions> = {},
): RateLimitRequestHandler {
  return rateLimiter(
    { windowMs: 1 * minute, max: 3, ...opts },
    "rl-contactform",
  );
}
