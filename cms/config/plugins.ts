export default ({ env }) => ({
  upload: {
    config: {
      provider: 'aws-s3',
      providerOptions: {
        accessKeyId: env('S3_ACCESS_KEY_ID'),
        secretAccessKey: env('S3_ACCESS_SECRET'),
        endpoint: env("S3_ENDPOINT"),
        region: env('S3_REGION'),
        forcePathStyle: true,
        signatureVersion: 'v4',
        params: {
          Bucket: env('S3_BUCKET'),
        },
      },
    },
  },
  email: {
    config: {
      provider: 'nodemailer',
      providerOptions: {
        url: env('EMAIL_SMTP_URL'),
      },
      settings: {
        defaultFrom: env('EMAIL_ADDRESS_FROM'),
        defaultReplyTo: env('EMAIL_ADDRESS_REPLY'),
      },
    },
  },
});