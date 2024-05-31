import { hostname as osHostname } from 'os';
import { env } from '@ilos/core/index.ts';

export const appUrl = env.or_fail('APP_APP_URL', 'http://localhost:4200');
export const apiUrl = env.or_fail('APP_API_URL', 'http://localhost:8080');
export const certUrl = env.or_fail('APP_CERT_URL', 'http://localhost:4200');
export const showcase = env.or_fail('APP_SHOWCASE_URL', 'https://localhost:1313');

export const port = env.or_int('PORT', 8080);
export const hostname = osHostname();

export const session = {
  secret: env.or_fail('APP_SESSION_SECRET'),
  name: env.or_fail('APP_SESSION_NAME', 'pdc-session'),

  /**
   * Cookie expiration (maxAge) in milliseconds
   * defaults to 30 days
   */
  maxAge: env.or_int('APP_SESSION_MAXAGE', 30 * 86400 * 1000),
};

export const rpc = {
  endpoint: env.or_fail('APP_RPC_ENDPOINT', '/rpc'),
};

export const cors = env.or_fail('APP_CORS', appUrl);
export const observatoryCors = env.or_fail('APP_OBSERVATORY_CORS', appUrl).split(',');
