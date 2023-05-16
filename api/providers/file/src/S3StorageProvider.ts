import {
  GetObjectCommand,
  GetObjectCommandInput,
  ListObjectsV2Command,
  ListObjectsV2CommandInput,
  ListObjectsV2CommandOutput,
  PutObjectCommand,
  PutObjectCommandInput,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import fs from 'fs';
import { S3ObjectList } from '.';

import { ConfigInterfaceResolver, provider, ProviderInterface } from '@ilos/common';
import { env } from '@ilos/core';
import { filenameFromPath, getBucketName, getBucketUrl } from './helpers/buckets';
import { BucketName } from './interfaces/BucketName';

@provider()
export class S3StorageProvider implements ProviderInterface {
  private s3Instances: Map<BucketName, S3Client> = new Map();
  private endpoint: string;
  private region: string;
  private pathStyle: boolean;

  public static readonly SEVEN_DAY: number = 7 * 86400;
  public static readonly TEN_MINUTES: number = 7 * 600;

  constructor(protected config: ConfigInterfaceResolver) {}

  async init(): Promise<void> {
    this.endpoint = env('AWS_ENDPOINT') as string;
    this.region = env('AWS_REGION') as string;
    this.pathStyle = env('AWS_S3_PATH_STYLE', false) ? true : false;

    this.s3Instances.set(BucketName.APDF, this.createInstance(BucketName.APDF));
    this.s3Instances.set(BucketName.Export, this.createInstance(BucketName.Export));
    this.s3Instances.set(BucketName.Public, this.createInstance(BucketName.Public));
  }

  protected createInstance(bucket: BucketName): S3Client {
    const bucketUrl = getBucketUrl(bucket);
    const s3BucketEndpoint = !this.pathStyle && bucketUrl !== '';

    return new S3Client({
      forcePathStyle: this.pathStyle,
      endpoint: s3BucketEndpoint ? bucketUrl : this.endpoint,
      region: this.region,
      logger: console,
      ...this.config.get('file.bucket.options', {}),
    });
  }

  async list(bucket: BucketName, prefix?: string): Promise<S3ObjectList> {
    const params: ListObjectsV2CommandInput = { Bucket: getBucketName(bucket) };

    if (prefix) {
      params.Prefix = prefix;
    }

    const command = new ListObjectsV2Command(params);
    const result: ListObjectsV2CommandOutput = await this.s3Instances.get(bucket).send(command);
    return result.Contents || [];
  }

  async upload(bucket: BucketName, filepath: string, filename?: string, prefix?: string): Promise<string> {
    // Check if file exists
    await fs.promises.access(filepath, fs.constants.R_OK);

    try {
      const rs = fs.createReadStream(filepath);
      let key = filename ?? filenameFromPath(filepath);

      if (prefix) {
        key = `${prefix}/${key}`;
      }

      const params: PutObjectCommandInput = {
        Bucket: getBucketName(bucket),
        Key: key,
        Body: rs,
        ContentDisposition: `attachment; filepath=${key}`,
      };

      const command = new PutObjectCommand(params);
      await this.s3Instances.get(bucket).send(command);

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

    return `${this.endpoint}/${getBucketName(bucket)}/${filekey}`;
  }

  async getSignedUrl(
    bucket: BucketName,
    filekey: string,
    expiresIn: number = S3StorageProvider.SEVEN_DAY,
  ): Promise<string> {
    try {
      const params: GetObjectCommandInput = {
        Bucket: getBucketName(bucket),
        Key: filekey,
        ResponseContentDisposition: `attachment; filepath=${filekey}`,
      };

      const command = new GetObjectCommand(params);
      const url = await getSignedUrl(this.s3Instances.get(bucket), command, { expiresIn });

      return url;
    } catch (e) {
      console.error(`S3StorageProvider Error: ${e.message} (${filekey})`);

      throw e;
    }
  }
}
