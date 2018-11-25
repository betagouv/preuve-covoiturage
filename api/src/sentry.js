const Sentry = require("@sentry/node");

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  release: "pdc-api@" + require("../package.json").version,
  environment: process.env.SENTRY_ENV || process.env.NODE_ENV,
});

module.exports = Sentry;
