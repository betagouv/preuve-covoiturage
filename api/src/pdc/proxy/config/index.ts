import * as cache from "./cache.ts";
import * as connections from "@/config/connections.ts";
import * as jwt from "./jwt.ts";
import * as kernel from "./kernel.ts";
import * as proxy from "./proxy.ts";
import * as sentry from "./sentry.ts";

export const config = {
  cache,
  connections,
  jwt,
  kernel,
  proxy,
  sentry,
};
