import { Pool, PoolConfig } from 'pg';
import { config as defaultConfig } from '../config.js';

export function createPool(config: PoolConfig = defaultConfig.pool): Pool {
  return new Pool({
    ...config,
  });
}
