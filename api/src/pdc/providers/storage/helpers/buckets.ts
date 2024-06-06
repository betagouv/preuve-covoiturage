import { env } from '@/ilos/core/index.ts';
import { path } from '@/deps.ts';
import { BucketName } from '../interfaces/BucketName.ts';

export function getBucketPrefix(): string {
  return env.or_fail('AWS_BUCKET_PREFIX', '');
}

export function getBucketName(bucket: BucketName): string {
  // bucketPrefix is used to namespace all buckets.
  // It is different than 'Prefix' (named folder here)
  // which is used to filter a list of objects and can be used to mock folders.
  const bucketPrefix = getBucketPrefix();

  return bucketPrefix.length ? `${bucketPrefix}-${bucket}` : bucket;
}

export function getBucketEndpoint(endpoint: string, bucket: BucketName): string {
  const key = bucket.toUpperCase().replace('-', '_');
  const override = env.or_fail(`AWS_BUCKET_${key}_ENDPOINT`, '');

  // Force the bucket endpoint with an environment variable.
  // The endpoint does not include the bucket name in the hostname.
  if (override !== '') {
    return override;
  }

  // inject the bucket name into the URL
  return endpoint;
}

export function filenameFromPath(filepath: string): string {
  const ext = path.extname(filepath);
  return (
    path
      .basename(filepath)
      .replace(ext, '')
      .replace(/[^a-z0-9_-]/g, '') + ext
  );
}
