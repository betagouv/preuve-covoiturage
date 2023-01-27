import * as jwt from './jwt';
import * as kernel from './kernel';
import * as proxy from './proxy';
import { redis } from './connections';
import * as sentry from './sentry';

export const config = {
  jwt,
  kernel,
  proxy,
  redis,
  sentry,
};
