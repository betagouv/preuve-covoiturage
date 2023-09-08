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

const defaultGlobalConfig: GlobalCacheConfig = {
  prefix: 'routecache',
  driver: null,
};

const defaultRouteConfig: RouteCacheConfig = {
  prefix: 'default',
  ttl: CacheTTL.DAY,
};

export { CacheMiddleware, GlobalCacheConfig, RouteCacheConfig, CacheTTL, StoreConnection };

export function cacheMiddleware(userGlobalConfig: Partial<GlobalCacheConfig> = {}): CacheMiddleware {
  const globalConfig = { ...defaultGlobalConfig, ...userGlobalConfig };
  const store: CacheStore = cacheStore(globalConfig);

  return {
    set(userRouteConfig: Partial<RouteCacheConfig> = {}) {
      const routeConfig: RouteCacheConfig = { ...defaultRouteConfig, ...userRouteConfig };

      return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        // check if the key exists, then return the value
        // or call the next middleware and store the response
        const key = getKey(req, res, globalConfig, routeConfig);
        const value = await store.get(key);

        console.debug({ key, value });

        // return the cached value
        if (value) {
          res.setHeader('X-Route-Cache', 'HIT');
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
