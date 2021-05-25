import { env } from '@ilos/core';

export const timeout = env('APP_REQUEST_TIMEOUT', 5000);
