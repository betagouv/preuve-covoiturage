import { Request, Response, NextFunction } from 'express';
import { Redis } from 'ioredis';

export type CacheKey = string;
export type CacheValue = any;
export type CachePrefix = string;

export type StoreConnection = Redis;
export type StoreDriver = Redis;
export type CacheStore = {
  get: (key: CacheKey) => Promise<CacheValue>;
  set: (key: CacheKey, value: CacheValue, ttl?: CacheTTL) => Promise<void>;
};

export type GlobalCacheConfig = {
  prefix: CachePrefix;
  driver: StoreDriver;
};

export type RouteCacheConfig = {
  prefix: CachePrefix;
  ttl: CacheTTL;
};

export enum CacheTTL {
  MINUTE = 60,
  HOUR = 60 * 60,
  DAY = 60 * 60 * 24,
  WEEK = 60 * 60 * 24 * 7,
  MONTH = (60 * 60 * 24 * 365) / 12,
  YEAR = 60 * 60 * 24 * 365,
}

export type CacheMiddleware = {
  set: (
    userRouteConfig?: Partial<RouteCacheConfig>,
  ) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
  flush: (prefix: CachePrefix) => Promise<void>;
};
