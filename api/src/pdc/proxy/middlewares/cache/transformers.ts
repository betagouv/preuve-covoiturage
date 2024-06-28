import { Buffer, gunzipSync, gzipSync, Request, Response } from "@/deps.ts";
import { createHash } from "@/lib/crypto/index.ts";
import { CacheKey, GlobalCacheConfig, RouteCacheConfig } from "./types.ts";

export async function getKey(
  req: Request,
  res: Response,
  globalConfig: GlobalCacheConfig,
  routeConfig: RouteCacheConfig,
): Promise<CacheKey> {
  const pfx = routeConfig.prefix
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

  // sha256 the URL to create a unique key
  const body = JSON.stringify(req.body || {});
  const hash = createHash(`${req.method} ${req.url} ${body}`);

  return `${globalConfig.prefix}:${pfx}:${hash}` as CacheKey;
}

export function deflate(data: string): Buffer {
  return gzipSync(data);
}

export function inflate(gzData: Buffer): string {
  const buf = gunzipSync(gzData);
  return buf.toString("utf8");
}
