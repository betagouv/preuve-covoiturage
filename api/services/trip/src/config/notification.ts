declare function env(key: string, fallback?: string | boolean): any;

export const templateIds = {
  export_csv: env('APP_MAILJET_TEMPLATE_EXPORT', ''),
};
