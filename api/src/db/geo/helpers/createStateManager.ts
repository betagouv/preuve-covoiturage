import { pg } from "@/deps.ts";
import { config as defaultConfig } from "../config.ts";
import {
  AppConfigInterface,
  DatabaseStateManagerInterface,
} from "../interfaces/index.ts";
import { DatabaseStateManager } from "../providers/index.ts";

export function createStateManager(
  pool: pg.Pool,
  config: AppConfigInterface = defaultConfig.app,
): DatabaseStateManagerInterface {
  return new DatabaseStateManager(pool, config);
}
