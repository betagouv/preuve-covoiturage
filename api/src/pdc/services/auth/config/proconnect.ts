import { env_or_fail } from "@/lib/env/index.ts";
export const client_id = env_or_fail("PROCONNECT_CLIENT_ID");
export const client_secret = env_or_fail("PROCONNECT_CLIENT_SECRET");
export const base_url = new URL(env_or_fail("PROCONNECT_BASE_URL"));
export const redirect_url = env_or_fail("PROCONNECT_REDIRECT_URL");
export const logout_redirect_url = env_or_fail("PROCONNECT_LOGOUT_REDIRECT_URL");
