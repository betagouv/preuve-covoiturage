import { env_or_fail } from "@/lib/env/index.ts";
export const client_id = env_or_fail("OIDC_CLIENT_ID");
export const client_secret = env_or_fail("OIDC_CLIENT_SECRET");
export const base_url = env_or_fail("OIDC_BASE_URL");
export const redirect_url = env_or_fail("OIDC_REDIRECT_URL");
