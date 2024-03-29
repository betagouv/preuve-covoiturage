export default ({ env }) => ({
  upload: {
    config: {
      provider: 'aws-s3',
      providerOptions: {
        ...(
          env('S3_PUBLIC_URL') ?
            { baseUrl: env('S3_PUBLIC_URL') } :
            {}
        ),
        s3Options: {
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
  meilisearch: {
    config: {
      host: env('MEILISEARCH_HOST'),
      apiKey: env('MEILISEARCH_MASTER_KEY'),
    }
  },
  betagouv: {
    enabled: true,
    resolve: './src/plugins/betagouv',
  },
});
