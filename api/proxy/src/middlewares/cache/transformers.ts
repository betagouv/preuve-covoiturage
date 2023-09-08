import { createHash } from 'crypto';
import { Request, Response } from 'express';
import { CacheKey, CacheValue, GlobalCacheConfig, RouteCacheConfig } from './types';

export function getKey(
  req: Request,
  res: Response,
  globalConfig: GlobalCacheConfig,
  routeConfig: RouteCacheConfig,
): CacheKey {
  const pfx = routeConfig.prefix
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

  // sha256 the URL to create a unique key
  const body = JSON.stringify(req.body || {});
  const sha = [];
  const hash = createHash('sha256');
  hash.on('readable', () => {
    const chunk = hash.read();
    if (chunk) {
      sha.push(chunk.toString('hex'));
    }
  });
  hash.write(`${req.method} ${req.url} ${body}`);
  hash.end();

  return `${globalConfig.prefix}:${pfx}:${sha.join('')}`;
}

export function getValue(req: Request, res: Response): CacheValue {
  return JSON.stringify(res.json());
}
