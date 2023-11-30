import { env } from '@ilos/core';

export const environment = env.or_fail('APP_ENV', 'local');
