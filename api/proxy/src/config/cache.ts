import { env } from '@ilos/core';

export const enabled = env('APP_ROUTECACHE_ENABLED', true);
export const authToken = env('APP_ROUTECACHE_AUTHTOKEN', '');
