import fs from 'fs';
import path from 'path';
import S3 from 'aws-sdk/clients/s3';

import { env } from '@ilos/core';
import { provider, ProviderInterface } from '@ilos/common';
import { BucketName } from './interfaces/BucketName';

@provider()
export class S3StorageProvider implements ProviderInterface {
  private s3: S3;
  private endpoint = env('AWS_ENDPOINT') as string;
  private region = env('AWS_REGION') as string;
  private prefix = env('AWS_BUCKET_PREFIX', env('NODE_ENV', 'local'));

  constructor() {}

  async init(): Promise<void> {
    this.s3 = new S3({ endpoint: this.endpoint, region: this.region, signatureVersion: 'v4' });
  }

  async copy(bucket: BucketName, filename: string): Promise<{ password: string; url: string }> {
    const Bucket = this.getBucketName(bucket);

    await fs.promises.access(filename, fs.constants.R_OK);

    try {
      const rs = fs.createReadStream(filename);
      const ext = path.extname(filename);
      const keyName =
        path
          .basename(filename)
          .replace(ext, '')
          .replace(/[^a-z0-9_-]/g, '') + ext;

      await this.s3
        .upload({ Bucket, Key: keyName, Body: rs, ContentDisposition: `attachment; filename=${keyName}` })
        .promise();

      const url = await this.s3.getSignedUrlPromise('getObject', {
        Bucket,
        Key: keyName,
        Expires: 7 * 86400,
        ResponseContentDisposition: `attachment; filename=${keyName}`,
      });

      return {
        password: '',
        url,
      };
    } catch (e) {
      console.error(`S3StorageProvider Error: ${e.message} (${filename})`);

      throw e;
    }
  }

  private getBucketName(bucket: BucketName): string {
    return `${this.prefix}-${bucket}`;
  }
}
