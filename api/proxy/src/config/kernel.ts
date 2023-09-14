import { env } from '@ilos/core';

export const timeout = env.or_fail('APP_REQUEST_TIMEOUT', 5000);
