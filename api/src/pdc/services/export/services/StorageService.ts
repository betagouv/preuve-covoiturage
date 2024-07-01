import { provider } from "@/ilos/common/Decorators.ts";
import {
  BucketName,
  S3ObjectList,
  S3StorageProvider,
} from "@/pdc/providers/storage/index.ts";

export type StorageServiceInterface = {
  init(): Promise<void>;
  list(): Promise<S3ObjectList>;
  upload(filepath: string): Promise<string>;
  getPublicUrl(filename: string): Promise<string>;
};

export abstract class StorageServiceInterfaceResolver
  implements StorageServiceInterface {
  public async init(): Promise<void> {
    throw new Error("Not implemented");
  }
  public async list(): Promise<S3ObjectList> {
    throw new Error("Not implemented");
  }
  public async upload(filepath: string): Promise<string> {
    throw new Error("Not implemented");
  }
  public async getPublicUrl(filename: string): Promise<string> {
    throw new Error("Not implemented");
  }
}

@provider({
  identifier: StorageServiceInterfaceResolver,
})
export class StorageService {
  private readonly bucket: BucketName = BucketName.Export;

  public constructor(
    protected s3StorageProvider: S3StorageProvider,
  ) {
  }

  public async init(): Promise<void> {
    await this.s3StorageProvider.init();
  }

  public async list(): Promise<S3ObjectList> {
    return await this.s3StorageProvider.list(this.bucket);
  }

  public async upload(filepath: string): Promise<string> {
    return await this.s3StorageProvider.upload(this.bucket, filepath);
  }

  public async getPublicUrl(filename: string): Promise<string> {
    return await this.s3StorageProvider.getPublicUrl(this.bucket, filename);
  }
}
