import { env } from '@ilos/core';

export const url = env.or_fail('APP_INSEE_API_URL', 'https://api.insee.fr/entreprises/sirene/V3');
export const token = env.or_fail('APP_INSEE_API_KEY', '');
export const timeout = env.or_int('APP_INSEE_TIMEOUT', 5000);
