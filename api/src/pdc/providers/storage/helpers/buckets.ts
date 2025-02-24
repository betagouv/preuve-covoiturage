import { env_or_fail } from "@/lib/env/index.ts";
import { basename, extname } from "@/lib/path/index.ts";
import { BucketName } from "../interfaces/BucketName.ts";

export function getBucketPrefix(): string {
  return env_or_fail("AWS_BUCKET_PREFIX", "");
}

export function getBucketName(bucket: BucketName, prefix?: string): string {
  // bucketPrefix is used to namespace all buckets.
  // It is different than 'Prefix' (named folder here)
  // which is used to filter a list of objects and can be used to mock folders.
  const bucketPrefix = prefix ?? getBucketPrefix();

  return bucketPrefix.length ? `${bucketPrefix}-${bucket}` : bucket;
}

export function getBucketEndpoint(
  endpoint: string,
  bucket: BucketName,
): string {
  const key = bucket.toUpperCase().replace("-", "_");
  const override = env_or_fail(`AWS_BUCKET_${key}_ENDPOINT`, "");

  // Force the bucket endpoint with an environment variable.
  // The endpoint does not include the bucket name in the hostname.
  if (override !== "") {
    return override;
  }

  // inject the bucket name into the URL
  return endpoint;
}

export function filenameFromPath(filepath: string): string {
  const ext = extname(filepath);
  return (basename(filepath)
    .replace(ext, "")
    .replace(/[^a-z0-9_-]/g, "") + ext);
}
