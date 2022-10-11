import S3, { PutObjectRequest } from 'aws-sdk/clients/s3';
import fs from 'fs';
import path from 'path';

import { ConfigInterfaceResolver, provider, ProviderInterface } from '@ilos/common';
import { env } from '@ilos/core';
import { BucketName } from './interfaces/BucketName';

@provider()
export class S3StorageProvider implements ProviderInterface {
  private s3Instances: Map<BucketName, S3> = new Map();
  private endpoint: string;
  private region: string;
  private prefix: string;
  private pathStyle: boolean;

  public static readonly SEVEN_DAY: number = 7 * 86400;
  public static readonly TEN_MINUTES: number = 7 * 600;

  constructor(protected config: ConfigInterfaceResolver) {}

  async init(): Promise<void> {
    this.endpoint = env('AWS_ENDPOINT') as string;
    this.region = env('AWS_REGION') as string;
    this.prefix = env('AWS_BUCKET_PREFIX', env('NODE_ENV', 'local')) as string;
    this.pathStyle = env('AWS_S3_PATH_STYLE', false) ? true : false;

    this.s3Instances.set(BucketName.Export, this.createInstance(BucketName.Export));
    this.s3Instances.set(BucketName.Public, this.createInstance(BucketName.Public));
  }

  protected createInstance(bucket: BucketName): S3 {
    const bucketUrl = this.getBucketUrl(bucket);
    const s3BucketEndpoint = !this.pathStyle && bucketUrl !== '';
    return new S3({
      s3ForcePathStyle: this.pathStyle,
      endpoint: s3BucketEndpoint ? bucketUrl : this.endpoint,
      region: this.region,
      signatureVersion: 'v4',
      s3BucketEndpoint,
      logger: console,
      ...this.config.get('file.bucket.options', {}),
    });
  }

  async list(bucket: BucketName, prefix?: string): Promise<S3.ObjectList> {
    const config: S3.ListObjectsV2Request = { Bucket: this.getBucketName(bucket) };

    if (prefix) {
      config.Prefix = prefix;
    }

    const result = await this.s3Instances.get(bucket).listObjectsV2(config).promise();
    return result.Contents || [];
  }

  async copy(
    inputBucket: BucketName,
    inputFileKey: string,
    targetBucket: BucketName,
    targetFileKey: string,
  ): Promise<void> {
    await this.s3Instances
      .get(inputBucket)
      .copyObject({
        CopySource: `${this.getBucketName(inputBucket)}/${inputFileKey}`,
        Bucket: this.getBucketName(targetBucket),
        Key: targetFileKey,
      })
      .promise();
  }

  async exists(bucket: BucketName, filepath: string): Promise<boolean> {
    try {
      await this.s3Instances
        .get(bucket)
        .headObject({ Bucket: this.getBucketName(bucket), Key: filepath })
        .promise();
      return true;
    } catch (e) {
      if (e.code === 'NotFound') {
        return false;
      }
      throw e;
    }
  }

  async upload(bucket: BucketName, filepath: string, filename?: string, prefix?: string): Promise<string> {
    const Bucket = this.getBucketName(bucket);

    await fs.promises.access(filepath, fs.constants.R_OK);

    try {
      const rs = fs.createReadStream(filepath);
      let key = filename ?? this.filenameFromPath(filepath);

      if (prefix) {
        key = `${prefix}/${key}`;
      }

      const params: PutObjectRequest = {
        Bucket,
        Key: key,
        Body: rs,
        ContentDisposition: `attachment; filepath=${key}`,
      };
      await this.s3Instances.get(bucket).upload(params).promise();

      return key;
    } catch (e) {
      console.error(`S3StorageProvider Error: ${e.message} (${filepath})`);
      throw e;
    }
  }

  async getPublicUrl(bucket: BucketName, filekey: string): Promise<string> {
    if (bucket !== BucketName.Public) {
      return this.getSignedUrl(bucket, filekey);
    }
    return `${this.endpoint}/${this.getBucketName(bucket)}/${filekey}`;
  }

  async getSignedUrl(
    bucket: BucketName,
    filekey: string,
    expires: number = S3StorageProvider.SEVEN_DAY,
  ): Promise<string> {
    try {
      const Bucket = this.getBucketName(bucket);

      const url = await this.s3Instances.get(bucket).getSignedUrlPromise('getObject', {
        Bucket,
        Key: filekey,
        Expires: expires,
        ResponseContentDisposition: `attachment; filepath=${filekey}`,
      });

      return url;
    } catch (e) {
      console.error(`S3StorageProvider Error: ${e.message} (${filekey})`);

      throw e;
    }
  }

  private getBucketName(bucket: BucketName): string {
    return `${this.prefix}-${bucket}`;
  }

  private getBucketUrl(bucket: BucketName): string {
    return env(`AWS_BUCKET_${bucket.toUpperCase()}_URL`, '') as string;
  }

  private filenameFromPath(filepath: string): string {
    const ext = path.extname(filepath);
    return (
      path
        .basename(filepath)
        .replace(ext, '')
        .replace(/[^a-z0-9_-]/g, '') + ext
    );
  }
}
