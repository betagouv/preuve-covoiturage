declare function env(key: string, fallback?: string): any;

export const mailjet = {
  public: env('APP_MJ_APIKEY_PUBLIC', null),
  private: env('APP_MJ_APIKEY_PRIVATE', null),
  email: env('APP_MJ_FROM_EMAIL'),
  name: env('APP_MJ_FROM_NAME'),
  template: env('APP_MJ_TEMPLATE'),
  debugEmail: env('APP_MJ_DEBUG_EMAIL'),
  debugFullname: env('APP_MJ_DEBUG_NAME'),
};

export const connectOptions = {
  version: 'v3.1',
  perform_api_call: env('APP_ENV') !== 'local' || !!mailjet.debugEmail,
};
