import { env } from '@ilos/core';

export const mail = {
  smtp: {
    url: env('APP_MAIL_SMTP_URL'),
  },
  debug: env('APP_MAIL_DEBUG_MODE', false),
  verifySmtp: env('APP_MAIL_VERIFY_SMTP', false),
  from: {
    name: env('APP_MAIL_FROM_NAME', 'Preuve de covoiturage'),
    email: env('APP_MAIL_FROM_EMAIL', 'contact@covoiturage.beta.gouv.fr'),
  },
  to: {
    name: env('APP_MAIL_DEBUG_NAME', 'Preuve de covoiturage'),
    email: env('APP_MAIL_DEBUG_EMAIL', 'contact@covoiturage.beta.gouv.fr'),
  },
};
