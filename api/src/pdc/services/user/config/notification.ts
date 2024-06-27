import { env } from "@/ilos/core/index.ts";

export const mail = {
  smtp: {
    url: env.or_fail("APP_MAIL_SMTP_URL"),
  },
  debug: env.or_false("APP_MAIL_DEBUG_MODE"),
  verifySmtp: env.or_false("APP_MAIL_VERIFY_SMTP"),
  from: {
    name: env.or_fail("APP_MAIL_FROM_NAME", "Preuve de covoiturage"),
    email: env.or_fail(
      "APP_MAIL_FROM_EMAIL",
      "contact@covoiturage.beta.gouv.fr",
    ),
  },
  to: {
    name: env.or_fail("APP_MAIL_DEBUG_NAME", "Preuve de covoiturage"),
    email: env.or_fail(
      "APP_MAIL_DEBUG_EMAIL",
      "contact@covoiturage.beta.gouv.fr",
    ),
  },
};
