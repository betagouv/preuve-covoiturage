import { env } from '@ilos/core/index.ts';

/**
 * Super complicated token to crypt the JWT tokens
 * e.g. Of4Nx{z%e)xLHL_m8,+i7*pCltKDyjaK0]+pQl._9J-|]%X[{Km'YPL}ynclQf:
 *
 * You can use the 504-bit WPA Key option from https://randomkeygen.com/
 *
 * Warning! Changing this invalidates all token and the users
 * will have to recreate them !
 */
export const secret = env.or_fail('APP_JWT_SECRET');

/**
 * Time to life: Token lifetime in seconds
 * -1 means infinity
 */
export const ttl = env.or_int('APP_JWT_TTL', 86400);

export const alg = 'HS256';
export const signOptions = {};
export const verifyOptions = {};
