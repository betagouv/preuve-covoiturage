import { env_or_fail, env_or_false } from "@/lib/env/index.ts";

export const enabled = env_or_false("APP_ENABLE_TEST_AUTH");

// Lazy: env_or_fail must not run at boot in environments where test auth is off
export function accounts(): Map<string, string> {
  return new Map<string, string>([
    [env_or_fail("APIE2E_AUTH_ADMIN_EMAIL"), env_or_fail("APIE2E_AUTH_ADMIN_PASSWORD")],
    [env_or_fail("APIE2E_AUTH_OPERATOR_EMAIL"), env_or_fail("APIE2E_AUTH_OPERATOR_PASSWORD")],
    [env_or_fail("APIE2E_AUTH_TERRITORY_EMAIL"), env_or_fail("APIE2E_AUTH_TERRITORY_PASSWORD")],
  ]);
}
