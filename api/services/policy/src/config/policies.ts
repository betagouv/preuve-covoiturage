import { env } from '@ilos/core';

export const finalize = {
  from: env('APP_POLICY_FINALIZE_DEFAULT_FROM', 15),
  to: env('APP_POLICY_FINALIZE_DEFAULT_TO', 5),
};
