import { AppConfigInterface, DatabaseStateManagerInterface } from '../interfaces/index.js';
import { config as defaultConfig } from '../config.js';
import { DatabaseStateManager } from '../providers/index.js';
import { Pool } from 'pg';

export function createStateManager(
  pool: Pool,
  config: AppConfigInterface = defaultConfig.app,
): DatabaseStateManagerInterface {
  return new DatabaseStateManager(pool, config);
}
