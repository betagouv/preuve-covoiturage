import { env, env_or_fail } from "@/lib/env/index.ts";
import { readFileSync } from "dep:fs";

function getKey(type: string): string {
  const asVarEnvName = `APP_CEE_${type}_KEY`;
  const asPathEnvName = `APP_CEE_${type}_KEY_PATH`;

  if (env(asVarEnvName)) {
    return env_or_fail(asVarEnvName).toString().replace(/\\n/g, "\n");
  } else if (env(asPathEnvName)) {
    return readFileSync(env_or_fail(asPathEnvName), "utf-8");
  } else {
    throw new Error(`Var ${asVarEnvName} not found`);
  }
}

export const public_key = getKey("PUBLIC");
export const private_key = getKey("PRIVATE");
