import { env } from '@ilos/core';

export const apiUrl = env.or_fail('APP_API_URL', 'http://localhost:8080');
export const appUrl = env.or_fail('APP_APP_URL', 'http://localhost:4200');
export const printerUrl = env.or_fail('APP_PRINTER_URL', 'http://localhost:3000');

export const certificateBaseUrl = `${apiUrl}/v3/certificates`;
