const url = require('url');

// mongoConfig.pathname.substr(1) || `pdc-${process.env.NODE_ENV}`
function getDatabase(pathname) {
  return pathname.substr(pathname.lastIndexOf('/') + 1);
}

function getMongoConfig(mongoUrl) {
  const mongoConfig = url.parse(mongoUrl);
  return {
    host: mongoConfig.hostname || 'localhost',
    port: Number(mongoConfig.port || 6379),
    database: getDatabase(mongoConfig.pathname),
    password: mongoConfig.auth ? mongoConfig.auth.split(':')[1] : undefined,
  };
}

export { getMongoConfig, getDatabase };
