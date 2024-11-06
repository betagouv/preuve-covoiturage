import type { PoolConfig } from "@/deps.ts";
import { Pool } from "@/deps.ts";
import { config as defaultConfig } from "../config.ts";

export function createPool(config: PoolConfig = defaultConfig.pool) {
  return new Pool({
    ...config,
  });
}
