// create Redis connection
import { ForbiddenException } from '@/ilos/common/index.ts';
import { NextFunction, Request, Response } from 'express';
import { cacheStore } from './cache/redis.ts';
import { deflate, getKey, inflate } from './cache/transformers.ts';
import {
  CacheTTL,
} from './cache/types.ts';
import type {
  CacheFlushResponse,
  CacheMiddleware,
  CachePrefix,
  CacheStore,
  GlobalCacheConfig,
  RouteCacheConfig,
  StoreConnection,
} from './cache/types.ts';
import { validate } from './cache/validators.ts';

const defaultGlobalConfig: GlobalCacheConfig = {
  authorizedMethods: ['HEAD', 'GET'],
  authToken: '',
  enabled: true,
  gzipped: true,
  prefix: 'routecache',
  driver: null,
};

const defaultRouteConfig: RouteCacheConfig = {
  prefix: 'default',
  ttl: CacheTTL.MINUTE,
};

export {
  CacheFlushResponse,
  CacheMiddleware,
  CachePrefix,
  CacheTTL,
  GlobalCacheConfig,
  RouteCacheConfig,
  StoreConnection,
};

export function cacheMiddleware(userGlobalConfig: Partial<GlobalCacheConfig> = {}): CacheMiddleware {
  const globalConfig = { ...defaultGlobalConfig, ...userGlobalConfig };
  const store: CacheStore = cacheStore(globalConfig);

  return {
    set(userRouteConfig: Partial<RouteCacheConfig> = {}) {
      const routeConfig: RouteCacheConfig = { ...defaultRouteConfig, ...userRouteConfig };

      // On disabled cache, set the header for user feedback and skip
      if (!globalConfig.enabled || !globalConfig.driver) {
        return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
          res.setHeader('X-Route-Cache', 'disabled');
          next();
        };
      }

      return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const { isValid, errors, warnings, headers } = await validate({ globalConfig, routeConfig, req, res });
        if (!isValid) {
          for (const [key, value] of headers.entries()) {
            res.setHeader(key, value);
          }

          for (const warn of warnings.values()) {
            console.warn({
              'X-Route-Cache-Url': req.url,
              'X-Route-Cache-Warn': warn.message,
            });
          }

          for (const error of errors.values()) {
            console.error({
              'X-Route-Cache-Url': req.url,
              'X-Route-Cache-Error': error.message,
            });
          }

          next();
          return;
        }

        // check if the key exists, then return the value
        // or call the next middleware and store the response
        const key = getKey(req, res, globalConfig, routeConfig);
        const buf = await store.get(key);
        const ttl = await store.ttl(key);

        // return the cached value
        if (buf) {
          res.setHeader('X-Route-Cache', 'HIT');
          res.setHeader('X-Route-Cache-TTL', ttl);

          const acceptGzip = (req.header('accept-encoding') || '').includes('gzip');
          if (acceptGzip && globalConfig.gzipped) {
            res.setHeader('Content-Encoding', 'gzip');
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.send(buf);
          } else {
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.send(inflate(buf));
          }

          return;
        }

        // process the request and cache the response
        res.setHeader('X-Route-Cache', 'MISS');

        // patch the res.send function to intercept the response
        const _res_send = res.send;
        res.send = (data: string, ...args) => {
          store.set(key, deflate(data), routeConfig.ttl);
          _res_send.apply(res, [data, ...args]);
          return res;
        };

        next();
      };
    },

    auth() {
      return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const token = String(globalConfig.authToken);
        const header = req.headers['x-route-cache-auth'];

        if (token === '') {
          return next(new Error('Please set APP_ROUTECACHE_AUTHTOKEN'));
        }

        if (token !== header) {
          throw new ForbiddenException(`Invalid X-Route-Cache-Auth header`);
        }

        next();
      };
    },

    async flush(prefix: CachePrefix = '*'): Promise<CacheFlushResponse> {
      const userPrefix = prefix === '*' ? '*' : `${prefix}:*`;
      const pattern = `${globalConfig.prefix}:${userPrefix}`;
      const keys = await store.scan(pattern);
      if (keys && keys.size) await store.del(keys);

      console.debug(`[route-cache] flushed ${keys.size} keys from pattern: ${pattern}`);

      return {
        size: keys.size,
        pattern,
      };
    },
  };
}
