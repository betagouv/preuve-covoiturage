import { Pool, PoolConfig } from 'pg';
import { config as defaultConfig } from '../config.ts';

export function createPool(config: PoolConfig = defaultConfig.pool): Pool {
  return new Pool({
    ...config,
  });
}
