import { env } from '@ilos/core';

export const render = {
  issuer: env('APP_API_URL'),
  audience: env('APP_PRINTER_URL'),
  bearer: env('APP_PRINTER_TOKEN'),
};
