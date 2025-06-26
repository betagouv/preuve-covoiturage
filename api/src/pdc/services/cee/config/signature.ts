import { env, env_or_fail } from "@/lib/env/index.ts";
import { logger } from "@/lib/logger/index.ts";
import { readFileSync } from "dep:fs";

type KeyType = "PRIVATE" | "PUBLIC";

function normalizeKey(key: string, type: KeyType): string {
  const k = String(key).replace(/[\r\n]+/g, "");

  if (!k.startsWith(`-----BEGIN ${type} KEY-----`)) {
    throw new Error(`Invalid key format, missing -----BEGIN ${type} KEY----`);
  }

  if (!k.endsWith(`-----END ${type} KEY-----`)) {
    throw new Error(`Invalid key format, missing -----END ${type} KEY-----`);
  }

  return k;
}

function getKey(type: KeyType): string {
  const asVarEnvName = `APP_CEE_${type}_KEY`;
  const asPathEnvName = `APP_CEE_${type}_KEY_PATH`;

  try {
    if (env(asVarEnvName)) {
      return normalizeKey(env_or_fail(asVarEnvName), type);
    } else if (env(asPathEnvName)) {
      return normalizeKey(readFileSync(env_or_fail(asPathEnvName), "utf-8"), type);
    } else {
      throw new Error(`Var ${asVarEnvName} not found`);
    }
  } catch (e) {
    if (env("APP_ENV") === "local") {
      logger.warn((e as Error).message);
      return "";
    }
    throw e;
  }
}

export const public_key = getKey("PUBLIC");
export const private_key = getKey("PRIVATE");
