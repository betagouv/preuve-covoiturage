import { _Object } from '@aws-sdk/client-s3';

export { APDFNameParamsInterface, APDFNameProvider, APDFNameResultsInterface } from './APDFNameProvider';
export { extensionHelper } from './helpers/extensionHelper';
export { BucketName } from './interfaces/BucketName';
export { S3StorageProvider } from './S3StorageProvider';
export type S3Object = _Object;
export type S3ObjectList = _Object[];
