import fs from 'fs';
import path from 'path';
import S3 from 'aws-sdk/clients/s3';

import { env } from '@ilos/core';
import { provider, ProviderInterface } from '@ilos/common';

@provider()
export class S3StorageProvider implements ProviderInterface {
  private s3: S3;
  private endpoint = env('AWS_ENDPOINT') as string;
  private region = env('AWS_REGION') as string;
  private bucket = env('AWS_BUCKET_NAME') as string;

  constructor() {}

  async init(): Promise<void> {
    this.s3 = new S3({ endpoint: this.endpoint, region: this.region, signatureVersion: 'v4' });
  }

  async copy(filename: string, password = ''): Promise<{ password: string; url: string }> {
    await fs.promises.access(filename, fs.constants.R_OK);

    try {
      const rs = fs.createReadStream(filename);
      const ext = path.extname(filename);
      const keyName =
        path
          .basename(filename)
          .replace(ext, '')
          .replace(/[^a-z0-9_-]/g, '') + ext;

      await this.s3.upload({ Bucket: this.bucket, Key: keyName, Body: rs }).promise();

      const url = await this.s3.getSignedUrlPromise('getObject', {
        Bucket: this.bucket,
        Key: keyName,
        Expires: 7 * 86400,
      });

      return {
        password: '',
        url,
      };
    } catch (e) {
      console.log('S3StorageProvider Error', filename, e.message);

      throw e;
    }
  }
}
