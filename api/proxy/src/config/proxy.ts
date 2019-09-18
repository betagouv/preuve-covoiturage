declare function env(key: string, fallback?: string | number): any;

export const appUrl = env('APP_APP_URL', 'http://localhost:4200');
export const apiUrl = env('APP_API_URL', 'http://localhost:8080');

export const port = env('PORT', 8080);

export const session = {
  secret: env('APP_SESSION_SECRET', 'Set me in .env file!!!'),
  name: env('APP_SESSION_NAME', 'pdc-session'),

  /**
   * Cookie expiration (maxAge) in milliseconds
   * defaults to 30 days
   */
  maxAge: env('APP_SESSION_MAXAGE', 30 * 86400 * 1000),
};

export const rpc = {
  open: env('APP_ENV', null) !== 'production',
  endpoint: env('APP_RPC_ENDPOINT', '/rpc'),
};

export const cors = ['review', 'dev'].indexOf(env('APP_ENV', 'local')) > -1 ? '*' : appUrl;
