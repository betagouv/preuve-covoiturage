import { env_or_fail } from "@/lib/env/index.ts";
import * as dex from "./dex.ts";
import * as jwt from "./jwt.ts";
import * as permissions from "./permissions.ts";
import * as proconnect from "./proconnect.ts";

export const app_url = env_or_fail("APP_DASHBOARD_URL");
export const config = {
  app_url,
  dex,
  jwt,
  permissions,
  proconnect,
};
