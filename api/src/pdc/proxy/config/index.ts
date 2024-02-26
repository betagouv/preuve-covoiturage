import * as cache from './cache';
import * as connections from '@config/connections';
import * as jwt from './jwt';
import * as kernel from './kernel';
import * as proxy from './proxy';
import * as sentry from './sentry';

export const config = {
  cache,
  connections,
  jwt,
  kernel,
  proxy,
  sentry,
};
