import { env } from '@ilos/core';

export const finalize = {
  from: env.or_int('APP_POLICY_FINALIZE_DEFAULT_FROM', 15),
  to: env.or_int('APP_POLICY_FINALIZE_DEFAULT_TO', 5),
};
