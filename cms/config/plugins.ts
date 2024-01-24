export default ({ env }) => ({
  upload: {
    config: {
      provider: 'aws-s3',
      providerOptions: {
        accessKeyId: env('S3_ACCESS_KEY_ID'),
        secretAccessKey: env('S3_ACCESS_SECRET'),
        endpoint: env("S3_ENDPOINT"),
        region: env('S3_REGION'),
        s3BucketEndpoint: true,
        s3ForcePathStyle: true,
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
        host: env('EMAIL_SMTP_HOST'),
        port: env('EMAIL_SMTP_PORT'),
        auth: {
          user: env('EMAIL_SMTP_USER'),
          pass: env('EMAIL_SMTP_PASSWORD'),
        },
      },
      settings: {
        defaultFrom: env('EMAIL_ADDRESS_FROM'),
        defaultReplyTo: env('EMAIL_ADDRESS_REPLY'),
      },
    },
  },
});