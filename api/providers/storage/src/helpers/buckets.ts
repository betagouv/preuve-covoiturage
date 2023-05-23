import { env } from '@ilos/core';
import path from 'node:path';
import { BucketName } from '../interfaces/BucketName';

export function getBucketPrefix(): string {
  return env('AWS_BUCKET_PREFIX', '') as string;
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
  const bucketUrl = env(`AWS_BUCKET_${key}_URL`, '') as string;

  // force the bucket URL with an environment variable
  if (bucketUrl !== '') {
    return bucketUrl;
  }

  // inject the bucket name into the URL
  return endpoint.replace('://', `://${getBucketName(bucket)}.`);
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
