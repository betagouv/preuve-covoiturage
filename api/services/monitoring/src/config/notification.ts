import { env } from '@ilos/core';

export const email = 'technique@covoiturage.beta.gouv.fr';
export const fullname = 'Équipe technique';
export const fromDays = 7;

export const mail = {
  smtp: {
    url: env('APP_MAIL_SMTP_URL'),
  },
  debug: env('APP_MAIL_DEBUG_MODE', false),
  from: {
    name: env('APP_MAIL_FROM_NAME', ''),
    email: env('APP_MAIL_FROM_EMAIL', ''),
  },
  to: {
    name: env('APP_MAIL_DEBUG_NAME', ''),
    email: env('APP_MAIL_DEBUG_EMAIL', ''),
  },
};
