import { env } from '@ilos/core';

export const templateIds = {
  export_csv: env('APP_MAILJET_TEMPLATE_EXPORT', ''),
  export_csv_error: env('APP_MAILJET_TEMPLATE_EXPORT', ''),
};
