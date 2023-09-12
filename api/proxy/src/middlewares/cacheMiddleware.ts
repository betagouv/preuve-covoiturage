// create Redis connection
import { NextFunction, Request, Response } from 'express';
import {
  CacheMiddleware,
  GlobalCacheConfig,
  RouteCacheConfig,
  CacheTTL,
  StoreConnection,
  CachePrefix,
  CacheStore,
} from './cache/types';
import { getKey } from './cache/transformers';
import { cacheStore } from './cache/redis';
import { validate } from './cache/validators';

const defaultGlobalConfig: GlobalCacheConfig = {
  authorizedMethods: ['GET'],
  enabled: true,
  prefix: 'routecache',
  driver: null,
};

const defaultRouteConfig: RouteCacheConfig = {
  prefix: 'default',
  ttl: CacheTTL.MINUTE,
};

export { CacheMiddleware, GlobalCacheConfig, RouteCacheConfig, CacheTTL, StoreConnection };

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
        const validation = await validate({ globalConfig, routeConfig, req, res });
        if (!validation.isValid) {
          for (const error of validation.errors) {
            res.setHeader('X-Route-Cache-Error', error.message);
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
        const value = await store.get(key);
        const ttl = await store.ttl(key);

        // return the cached value
        if (value) {
          res.setHeader('X-Route-Cache', 'HIT');
          res.setHeader('X-Route-Cache-TTL', ttl);
          res.send(value);
          return;
        }

        // process the request and cache the response
        res.setHeader('X-Route-Cache', 'MISS');

        // patch the res.send function to intercept the response
        const _res_send = res.send;
        res.send = (data: any, ...args) => {
          store.set(key, data);
          _res_send.apply(res, [data, ...args]);
          return res;
        };

        next();
      };
    },

    async flush(prefix: CachePrefix = '*') {
      // flush all keys with the same prefix or all if *
    },
  };
}
