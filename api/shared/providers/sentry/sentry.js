const Sentry = require('@sentry/node');
const { version } = require('../../package.json');

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  release: `pdc-api@${version}`,
  environment: process.env.SENTRY_ENV || process.env.NODE_ENV,
});

module.exports = Sentry;
