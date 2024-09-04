import { env_or_fail, env_or_false } from "@/lib/env/index.ts";

export const email = "technique@covoiturage.beta.gouv.fr";
export const fullname = "Équipe technique";
export const fromDays = 7;

export const mail = {
  smtp: {
    url: env_or_fail("APP_MAIL_SMTP_URL"),
  },
  debug: env_or_false("APP_MAIL_DEBUG_MODE"),
  from: {
    name: env_or_fail("APP_MAIL_FROM_NAME", ""),
    email: env_or_fail("APP_MAIL_FROM_EMAIL", ""),
  },
  to: {
    name: env_or_fail("APP_MAIL_DEBUG_NAME", ""),
    email: env_or_fail("APP_MAIL_DEBUG_EMAIL", ""),
  },
};
