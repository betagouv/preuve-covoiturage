import { env } from '@ilos/core';
import { templates } from '../shared/configuration/mailjet';

export const mail = {
  debug: env('APP_MAILJET_DEBUG_MODE', false),
  driver: 'mailjet',
  driverOptions: {
    public: env('APP_MAILJET_PUBLIC_KEY', ''),
    private: env('APP_MAILJET_PRIVATE_KEY', ''),
  },
  sendOptions: {
    template: templates.default,
  },
  from: {
    name: env('APP_MAILJET_FROM_NAME', ''),
    email: env('APP_MAILJET_FROM_EMAIL', ''),
  },
  defaultSubject: 'Registre de preuve de covoiturage',
  to: {
    name: env('APP_MAILJET_DEBUG_NAME', ''),
    email: env('APP_MAILJET_DEBUG_EMAIL', ''),
  },
};

export const templateIds = {
  invitation: templates.invitation,
  forgotten: templates.forgotten_password,
  emailChange: templates.email,
};
