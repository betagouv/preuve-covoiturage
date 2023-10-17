import { CacheKey, CachePattern, CacheStore, CacheTTL, CacheValue, GlobalCacheConfig } from './types';

export function cacheStore(config: GlobalCacheConfig): CacheStore {
  const { driver } = config;

  return {
    async get(key: CacheKey): Promise<CacheValue | null> {
      if (!driver) return null;
      // console.debug('cache get', { key });
      const str = await driver.get(key);
      if (!str) return null;
      return Buffer.from(str, 'base64');
    },

    async set(key: CacheKey, value: CacheValue, ttl?: CacheTTL): Promise<void> {
      if (!driver) return;
      // console.debug('cache set', { key, value });
      await driver.set(key, value.toString('base64'), 'EX', ttl || CacheTTL.MINUTE);
    },

    async del(keys: Set<CacheKey>): Promise<number> {
      if (!driver) return;
      // console.debug('cache del', { keys });
      return driver.del(...keys);
    },

    async ttl(key: CacheKey): Promise<number | null> {
      if (!driver) return null;
      // console.debug('cache ttl', { key });
      return driver.ttl(key);
    },

    async scan(pattern: CachePattern, batchSize: number = 50): Promise<Set<CacheKey>> {
      if (!driver) return null;

      let cursor = 0;
      const list: Set<CacheKey> = new Set();

      do {
        const [cur, keys] = await driver.scan(cursor, 'MATCH', pattern, 'COUNT', batchSize);
        cursor = parseInt(cur, 10);
        keys.map((k) => list.add(k));
      } while (cursor > 0);

      return list;
    },
  };
}
