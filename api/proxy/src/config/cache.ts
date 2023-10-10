import { env } from '@ilos/core';

export const enabled = env.or_true('APP_ROUTECACHE_ENABLED');
export const gzipped = env.or_true('APP_ROUTECACHE_GZIP_ENABLED');
export const authToken = env.or_fail('APP_ROUTECACHE_AUTHTOKEN');
