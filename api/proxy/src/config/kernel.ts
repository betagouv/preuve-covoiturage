import { env } from '@ilos/core';

export const timeout = env.or_int('APP_REQUEST_TIMEOUT', 5000);
