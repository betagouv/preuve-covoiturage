import {
  GetObjectCommand,
  GetObjectCommandInput,
  getSignedUrl,
  ListObjectsV2Command,
  ListObjectsV2CommandInput,
  ListObjectsV2CommandOutput,
  PutObjectCommand,
  PutObjectCommandInput,
  S3Client,
} from "@/deps.ts";
import {
  ConfigInterfaceResolver,
  provider,
  ProviderInterface,
} from "@/ilos/common/index.ts";
import { env } from "@/ilos/core/index.ts";
import { fs } from "@/deps.ts";
import { S3ObjectList } from "./index.ts";
import { filenameFromPath, getBucketName } from "./helpers/buckets.ts";
import { BucketName } from "./interfaces/BucketName.ts";

// @aws-sdk/client-s3 doc: https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/index.html

@provider()
export class S3StorageProvider implements ProviderInterface {
  private s3Instances: Map<BucketName, S3Client> = new Map();
  private endpoint: string;
  private region: string;

  public static readonly SEVEN_DAY: number = 7 * 86400;
  public static readonly TEN_MINUTES: number = 7 * 600;

  constructor(protected config: ConfigInterfaceResolver) {}

  async init(): Promise<void> {
    this.endpoint = env.or_fail("AWS_ENDPOINT");
    this.region = env.or_fail("AWS_REGION");

    // Create s3 instances for all buckets in the BucketName list
    this.s3Instances.set(BucketName.APDF, this.createInstance(BucketName.APDF));
    this.s3Instances.set(
      BucketName.Export,
      this.createInstance(BucketName.Export),
    );
    this.s3Instances.set(
      BucketName.Public,
      this.createInstance(BucketName.Public),
    );
  }

  protected createInstance(bucket: BucketName): S3Client {
    return new S3Client({
      forcePathStyle: true, // hosting uses path-style
      endpoint: this.endpoint,
      region: this.region,
      ...this.config.get("storage.bucket.options", {}),
    });
  }

  async list(bucket: BucketName, folder?: string): Promise<S3ObjectList> {
    const params: ListObjectsV2CommandInput = { Bucket: getBucketName(bucket) };

    if (folder) {
      params.Prefix = folder;
    }

    console.info(`[S3StorageProvider:list] bucket ${params.Bucket}/${folder}`);

    const command = new ListObjectsV2Command(params);
    const result: ListObjectsV2CommandOutput = await this.s3Instances.get(
      bucket,
    ).send(command);
    return result.Contents || [];
  }

  async upload(
    bucket: BucketName,
    filepath: string,
    filename?: string,
    folder?: string,
  ): Promise<string> {
    // Check if file exists
    await fs.promises.access(filepath, fs.constants.R_OK);

    try {
      const rs = fs.createReadStream(filepath);
      let key = filename ?? filenameFromPath(filepath);

      if (folder) {
        key = `${folder}/${key}`;
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
      const url = await getSignedUrl(this.s3Instances.get(bucket), command, {
        expiresIn,
      });

      return url;
    } catch (e) {
      console.error(`S3StorageProvider Error: ${e.message} (${filekey})`);

      throw e;
    }
  }
}
