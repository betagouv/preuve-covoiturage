import { CacheKey, CacheStore, CacheTTL, CacheValue, GlobalCacheConfig } from './types';

export function cacheStore(config: GlobalCacheConfig): CacheStore {
  const { driver } = config;

  return {
    async get(key: CacheKey): Promise<CacheValue | null> {
      if (!driver) return null;
      // console.debug('cache get', { key });
      return driver.get(key);
    },

    async set(key: CacheKey, value: CacheValue, ttl?: CacheTTL): Promise<void> {
      if (!driver) return;
      // console.debug('cache set', { key, value });
      await driver.set(key, value, 'EX', ttl || CacheTTL.MINUTE);
    },

    async ttl(key: CacheKey): Promise<number | null> {
      if (!driver) return null;
      // console.debug('cache ttl', { key });
      return driver.ttl(key);
    },
  };
}
