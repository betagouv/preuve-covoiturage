import { env_or_fail, env_or_true } from "@/lib/env/index.ts";

export const enabled = env_or_true("APP_ROUTECACHE_ENABLED");
export const gzipped = env_or_true("APP_ROUTECACHE_GZIP_ENABLED");
export const authToken = env_or_fail("APP_ROUTECACHE_AUTHTOKEN");
