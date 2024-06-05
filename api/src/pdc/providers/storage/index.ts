import { _Object } from '@aws-sdk/client-s3';

export { APDFNameProvider } from './APDFNameProvider.ts';
export type { APDFNameParamsInterface, APDFNameResultsInterface } from './APDFNameProvider.ts';
export { extensionHelper } from './helpers/extensionHelper.ts';
export { BucketName } from './interfaces/BucketName.ts';
export { S3StorageProvider } from './S3StorageProvider.ts';
export type S3Object = _Object;
export type S3ObjectList = _Object[];
