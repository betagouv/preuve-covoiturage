import { env } from '@ilos/core';

export const s3UploadEnabled = env('APP_APDF_S3_UPLOAD_ENABLED', true);
