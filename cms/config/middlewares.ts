export default [
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'img-src': [
            "'self'",
            "data:",
            "blob:",
            `*.${process.env.TRUSTED_ROOT_DOMAIN}`,
          ],
          'media-src': [
            "'self'",
            "data:",
            "blob:",
            `*.${process.env.TRUSTED_ROOT_DOMAIN}`,
          ],
        },
      },
    },
  },
  'strapi::cors',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
