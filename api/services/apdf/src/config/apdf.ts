import { env } from '@ilos/core';

export const s3UploadEnabled = env('APP_APDF_S3_UPLOAD_ENABLED', true);

/**
 * APDF of the current month can be hidden.
 * Other months will display
 * Super admins are not affected
 */
export const showLastMonth = env('APP_APDF_SHOW_LAST_MONTH', true);
