import { env } from '@ilos/core';

export const to = env.or_fail('APP_CONTACTFORM_TO', 'contact@covoiturage.beta.gouv.fr');
