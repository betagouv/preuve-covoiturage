import type { PoolConfig } from "dep:pg";
import pg from "dep:pg";
import { config as defaultConfig } from "../config.ts";

export function createPool(config: PoolConfig = defaultConfig.pool) {
  return new pg.Pool({
    ...config,
  });
}
