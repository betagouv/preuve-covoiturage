import { Pool } from "@/deps.ts";
import type { PoolConfig } from "@/deps.ts";
import { config as defaultConfig } from "../config.ts";

export function createPool(config: PoolConfig = defaultConfig.pool): Pool {
  return new Pool({
    ...config,
  });
}
