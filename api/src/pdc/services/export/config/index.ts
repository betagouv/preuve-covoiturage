import { pickAppUrl } from "@/config/urls.ts";
import { env } from "@/lib/env/index.ts";
import * as ajv from "./ajv.ts";
import * as app from "./app.ts";
import * as export_ from "./export.ts";

export const config = {
  ajv,
  app,
  // URL du front (lien vers les exports dans les e-mails). Pas via config/proxy.ts : il exige APP_SESSION_SECRET.
  app_url: pickAppUrl(env("APP_APP_URL"), env("APP_DASHBOARD_V2_URL")),
  export: export_,
};
