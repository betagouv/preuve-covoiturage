import { env } from '@ilos/core';

export const email = 'technique@covoiturage.beta.gouv.fr';
export const fullname = 'Équipe technique';
export const fromDays = 7;

export const mail = {
  smtp: env('APP_SMTP_URL'),
  debug: env('APP_DEBUG_MODE', false),
  from: {
    name: env('APP_FROM_NAME', ''),
    email: env('APP_FROM_EMAIL', ''),
  },
  to: {
    name: env('APP_DEBUG_NAME', ''),
    email: env('APP_DEBUG_EMAIL', ''),
  },
};

