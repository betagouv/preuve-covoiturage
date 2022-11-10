import { env } from '@ilos/core';

export const enabled = env('APP_USER_REGISTRATION_ENABLED', false);
