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

const dbUrl = URL.parse(process.env.APP_POSTGRES_URL);
const [user, ...password] = dbUrl.auth.split(':');

const config = {
      driver: 'pg',
      user,
      password: password.join(''),
      host: dbUrl.hostname,
      database: dbUrl.pathname.replace('/', ''),
      port: parseInt(dbUrl.port, 10),
  ...(Object.keys(postgresTls).length ? { ssl: {...postgresTls, rejectUnauthorized: false }} : {}),
};

migrate(config, false)
  .then(() => console.log('Done'))
  .catch((e) => console.error(e))
