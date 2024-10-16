import { env } from "@/lib/env/index.ts";

export const datagouv = {
  enabled: env("APP_DATAGOUV_ENABLED") === "true",
  notify: env("APP_DATAGOUV_NOTIFY") === "true",
  contact: env("APP_DATAGOUV_CONTACT") || null,
  key: env("APP_DATAGOUV_KEY") || null,
  url: env("APP_DATAGOUV_URL") || "https://api.gouv.fr/api/1/datasets/",
};
