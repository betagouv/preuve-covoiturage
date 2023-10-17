import { env } from '@ilos/core';

export const apiUrl = env.or_fail('APP_API_URL', 'http://localhost:8080');
export const appUrl = env.or_fail('APP_APP_URL', 'http://localhost:4200');
