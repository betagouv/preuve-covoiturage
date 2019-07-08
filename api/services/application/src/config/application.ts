declare function env(key: string, fallback?: any): any;

/**
 * Mongo collection to use for storing data
 */
export const collectionName = env('APP_APPLICATION_DB', 'applications');
export const db = env('APP_MONGO_DB');

export const jwt = {
  /**
   * Super complicated token to crypt the JWT tokens
   * e.g. Of4Nx{z%e)xLHL_m8,+i7*pCltKDyjaK0]+pQl._9J-|]%X[{Km'YPL}ynclQf:
   *
   * You can use the 504-bit WPA Key option from https://randomkeygen.com/
   *
   * Warning! Changing this invalidates all token and the users
   * will have to recreate them !
   */
  secret: env('APP_JWT_SECRET'),

  /**
   * Time to life: Token lifetime in seconds
   * -1 means infinity
   */
  ttl: env('APP_JWT_TTL', -1),
};
