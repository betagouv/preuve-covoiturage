import { env } from '@ilos/core';

export const enabled = env.or_fail('APP_USER_REGISTRATION_ENABLED', env.or_fail('CI', 'false')) === 'true';
