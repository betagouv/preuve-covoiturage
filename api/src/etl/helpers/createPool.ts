import pg from '@/deps.ts';
import type { PoolConfig } from '@/deps.ts';
import { config as defaultConfig } from '../config.ts';

export function createPool(config: PoolConfig = defaultConfig.pool): pg.Pool {
  return new pg.Pool({
    ...config,
  });
}
