import { NextFunction, Request, Response } from '@/deps.ts';
import { Redis } from '@/deps.ts';

export type CacheEnabled = boolean;
export type CompressionEnabled = boolean;
export type CacheKey = string;
export type CacheValue = Buffer;
export type CachePrefix = string;
export type CachePattern = string;

export type StoreConnection = Redis;
export type StoreDriver = Redis | null;
export type CacheStore = {
  get: (key: CacheKey) => Promise<CacheValue | null>;
  set: (key: CacheKey, value: CacheValue, ttl?: CacheTTL) => Promise<void>;
  del: (keys: Set<CacheKey>) => Promise<number>;
  ttl: (key: CacheKey) => Promise<number | null>;
  scan: (pattern: CachePattern) => Promise<Set<CacheKey>>;
};

export type GlobalCacheConfig = {
  enabled: CacheEnabled;
  prefix: CachePrefix;
  driver: StoreDriver;
  authorizedMethods: HttpVerb[];
  authToken: string;
  gzipped: CompressionEnabled;
};

export type RouteCacheConfig = {
  prefix: CachePrefix;
  ttl: CacheTTL;
};

export enum CacheTTL {
  SECOND = 1,
  MINUTE = 60,
  HOUR = 60 * 60,
  DAY = 60 * 60 * 24,
  WEEK = 60 * 60 * 24 * 7,
  MONTH = (60 * 60 * 24 * 365) / 12,
  YEAR = 60 * 60 * 24 * 365,
}

export const HttpVerbs = ['HEAD', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const;
export type HttpVerb = (typeof HttpVerbs)[number];

export type CacheMiddleware = {
  set: (
    userRouteConfig?: Partial<RouteCacheConfig>,
  ) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
  auth: () => (req: Request, res: Response, next: NextFunction) => Promise<void>;
  flush: (prefix: CachePrefix) => Promise<CacheFlushResponse>;
};

export type CacheValidatorParams = {
  globalConfig: GlobalCacheConfig;
  routeConfig: RouteCacheConfig;
  req: Request;
  res: Response;
};

export type CacheValidatorResponse = {
  isValid: boolean;
  errors: Set<Error>;
  warnings: Set<Error>;
  headers: Map<string, string>;
};

export type CacheFlushResponse = {
  size: number;
  pattern: CachePattern;
};
