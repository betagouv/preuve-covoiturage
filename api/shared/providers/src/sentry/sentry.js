const Sentry = require('@sentry/node');
const path = require('path')
const { version } = require(path.resolve(process.cwd(), './package.json'));

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  release: `pdc-api@${version}`,
  environment: process.env.SENTRY_ENV || process.env.NODE_ENV,
});

export default Sentry;
