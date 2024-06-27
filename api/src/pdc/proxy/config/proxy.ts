import { env_or_fail, env_or_int } from "@/lib/env/index.ts";
import { getHostName } from "@/lib/net/index.ts";

export const appUrl = env_or_fail("APP_APP_URL", "http://localhost:4200");
export const apiUrl = env_or_fail("APP_API_URL", "http://localhost:8080");
export const certUrl = env_or_fail("APP_CERT_URL", "http://localhost:4200");
export const showcase = env_or_fail(
  "APP_SHOWCASE_URL",
  "https://localhost:1313",
);

export const port = env_or_int("PORT", 8080);
export const hostname = getHostName();

export const session = {
  secret: env_or_fail("APP_SESSION_SECRET"),
  name: env_or_fail("APP_SESSION_NAME", "pdc-session"),

  /**
   * Cookie expiration (maxAge) in milliseconds
   * defaults to 30 days
   */
  maxAge: env_or_int("APP_SESSION_MAXAGE", 30 * 86400 * 1000),
};

export const rpc = {
  endpoint: env_or_fail("APP_RPC_ENDPOINT", "/rpc"),
};

export const cors = env_or_fail("APP_CORS", appUrl);
export const observatoryCors = env_or_fail("APP_OBSERVATORY_CORS", appUrl)
  .split(",");
