import { env } from '@ilos/core';
import path from 'node:path';
import { BucketName } from '../interfaces/BucketName';

export function getBucketName(bucket: BucketName): string {
  return `${this.prefix}-${bucket}`;
}

export function getBucketUrl(bucket: BucketName): string {
  return env(`AWS_BUCKET_${bucket.toUpperCase()}_URL`, '') as string;
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
