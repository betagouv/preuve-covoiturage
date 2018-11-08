const Sentry = require("@sentry/node");

if (process.env.NODE_ENV !== "development") {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    release: "pop-api@" + require("../package.json").version,
    environment: process.env.NODE_ENV
  });
}

function capture(err) {
  console.log("New Error : ", err);
  if (Sentry) {
    Sentry.captureException(JSON.stringify(err));
  }
}

module.exports = {
  capture
};
