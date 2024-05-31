import { env } from '@ilos/core/index.ts';

export const s3UploadEnabled = env.or_fail('APP_APDF_S3_UPLOAD_ENABLED', 'true') === 'true';

/**
 * APDF of the current month can be hidden.
 * Other months will display
 * Super admins are not affected
 */
export const showLastMonth = env.or_fail('APP_APDF_SHOW_LAST_MONTH', 'true') === 'true';
