const URL = require('url');
const { readFileSync } = require('fs');
const { migrate } = require('./index');

function tlsSetup(key, baseEnvKey) {
  const asVarEnvName = baseEnvKey;
  const asPathEnvName = `${baseEnvKey}_PATH`;

  let cert;
  if (asVarEnvName in process.env) {
    cert = process.env[asVarEnvName].toString().replace(/\\n/g, '\n');
  } else if (asPathEnvName in process.env) {
    cert = readFileSync(process.env[asPathEnvName], 'utf-8');
  } else {
    return {};
  }
  return { [key]: cert };
}
const postgresTls = {
  ...tlsSetup('ca', 'APP_POSTGRES_CA'),
  ...tlsSetup('cert', 'APP_POSTGRES_CERT'),
  ...tlsSetup('key', 'APP_POSTGRES_KEY'),
};

const dbUrl = new URL(process.env.APP_POSTGRES_URL);
const config = {
      driver: 'pg',
      user: dbUrl.username,
      password: dbUrl.password,
      host: dbUrl.hostname,
      database: dbUrl.pathname.replace('/', ''),
      port: parseInt(dbUrl.port),
  ...(Object.keys(postgresTls).length ? { ssl: postgresTls } : {}),
    };

migrate(config, false)
  .then(() => console.log('Done'))
  .catch((e) => console.error(e))