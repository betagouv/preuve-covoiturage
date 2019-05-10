declare function env(key: string, fallback?: string): any;

export const mailjet = {
  public: env('MJ_APIKEY_PUBLIC', null),
  private: env('MJ_APIKEY_PRIVATE', null),
  email: env('MJ_FROM_EMAIL'),
  name: env('MJ_FROM_NAME'),
  template: env('MJ_TEMPLATE'),
  debug_email: env('MJ_DEBUG_EMAIL'),
  debug_fullname: env('MJ_DEBUG_NAME'),
};

export const mailjetConfig = {
  version: 'v3.1',
  perform_api_call: env('APP_ENV') !== 'local' || !!mailjet.debug_email,
};

