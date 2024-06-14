import { fs, S3Client, URL } from "@/deps.ts";
import {
  ConfigInterfaceResolver,
  provider,
  ProviderInterface,
} from "@/ilos/common/index.ts";
import { env } from "@/ilos/core/index.ts";
import { filenameFromPath, getBucketName } from "./helpers/buckets.ts";
import { S3ObjectList } from "./index.ts";
import { BucketName } from "./interfaces/BucketName.ts";

@provider()
export class S3StorageProvider implements ProviderInterface {
  private s3Instances: Map<BucketName, S3Client> = new Map();
  private endpoint: string | undefined;
  private region: string | undefined;

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
    if (!this.endpoint || !this.region) {
      throw new Error();
    }
    const endPointUrl = new URL(this.endpoint);
    const params = {
      pathStyle: true,
      endPoint: endPointUrl.hostname,
      port: parseInt(endPointUrl.port || "443", 10),
      useSSL: endPointUrl.protocol === "https:",
      region: this.region,
      bucket,
      accessKey: env.or_fail("AWS_ACCESS_KEY_ID"),
      secretKey: env.or_fail("AWS_SECRET_ACCESS_KEY"),
      ...this.config.get("storage.bucket.options", {}),
    };
    return new S3Client(params);
  }

  async list(bucket: BucketName, folder?: string): Promise<S3ObjectList> {
    const client = this.s3Instances.get(bucket);
    if (!client) {
      throw new Error();
    }
    const params = {
      prefix: folder,
      bucketName: getBucketName(bucket),
    };
    console.info(
      `[S3StorageProvider:list] bucket ${params.bucketName}/${params.prefix}`,
    );
    const generator = client.listObjects(params);
    const result = [];
    for await (const r of generator) {
      result.push(r);
    }
    return result;
  }

  async upload(
    bucket: BucketName,
    filepath: string,
    filename?: string,
    folder?: string,
  ): Promise<string> {
    // Check if file exists
    await fs.promises.access(filepath, fs.constants.R_OK);
    const client = this.s3Instances.get(bucket);
    if (!client) {
      throw new Error();
    }
    try {
      const rs = await Deno.open(filepath, { read: true });
      let key = filename ?? filenameFromPath(filepath);

      if (folder) {
        key = `${folder}/${key}`;
      }

      const params = {
        bucketName: getBucketName(bucket),
      };

      await client.putObject(key, rs.readable, params);

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
    const client = this.s3Instances.get(bucket);
    if (!client) {
      throw new Error();
    }
    try {
      const url = await client.getPresignedUrl("GET", filekey, {
        bucketName: getBucketName(bucket),
        expirySeconds: expiresIn,
      });
      return url;
    } catch (e) {
      console.error(`S3StorageProvider Error: ${e.message} (${filekey})`);

      throw e;
    }
  }
}
