import { AppConfigInterface, DatabaseStateManagerInterface } from '../interfaces/index.ts';
import { config as defaultConfig } from '../config.ts';
import { DatabaseStateManager } from '../providers/index.ts';
import { Pool } from 'pg';

export function createStateManager(
  pool: Pool,
  config: AppConfigInterface = defaultConfig.app,
): DatabaseStateManagerInterface {
  return new DatabaseStateManager(pool, config);
}
