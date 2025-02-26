import type { S3Object } from "dep:s3-lite-client";

export { APDFNameProvider } from "./APDFNameProvider.ts";
export type { APDFNameParamsInterface, APDFNameResultsInterface } from "./APDFNameProvider.ts";
export { extensionHelper } from "./helpers/extensionHelper.ts";
export { BucketName } from "./interfaces/BucketName.ts";
export { S3StorageProvider } from "./S3StorageProvider.ts";

export type { S3Object };
export type S3ObjectList = S3Object[];
