import pg from 'pg';
import type { PoolConfig } from 'pg';
import { config as defaultConfig } from '../config.ts';

export function createPool(config: PoolConfig = defaultConfig.pool): pg.Pool {
  return new pg.Pool({
    ...config,
  });
}
