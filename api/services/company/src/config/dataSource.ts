import { env } from '@ilos/core';

export const url = env('APP_INSEE_API_URL', 'https://api.insee.fr/entreprises/sirene/V3');
export const token = env('APP_INSEE_API_KEY');
