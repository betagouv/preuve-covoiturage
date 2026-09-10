import * as connections from "@/config/connections.ts";
import * as proxy from "@/config/proxy.ts";
import * as cache from "./cache.ts";
import * as dex from "./dex.ts";
import * as kernel from "./kernel.ts";
import * as notification from "./notification.ts";
import * as sentry from "./sentry.ts";

export const config = {
  cache,
  connections,
  dex,
  kernel,
  notification,
  proxy,
  sentry,
};
