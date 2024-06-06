import { readFileSync, URL, process } from '@/deps.ts';
import { env } from '@/ilos/core/index.ts';

function unnestRedisConnectionString(connectionString: string): {
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  db?: number;
} {
  const connectionURL = new URL(connectionString);
  return {
    host: connectionURL.hostname,
    port: parseInt(connectionURL.port, 10) || 6379,
    username: connectionURL.username || undefined,
    password: connectionURL.password || undefined,
    db: parseInt(connectionURL.pathname.replace(/\//g, ''), 10) || 0,
  };
}

function tlsSetup(key: string, baseEnvKey: string): { [k: string]: string } {
  const asVarEnvName = baseEnvKey;
  const asPathEnvName = `${baseEnvKey}_PATH`;

  let cert: string;
  if (asVarEnvName in process.env) {
    cert = env.or_fail(asVarEnvName).replace(/\\n/g, '\n');
  } else if (asPathEnvName in process.env) {
    cert = readFileSync(env.or_fail(asPathEnvName), 'utf-8');
  } else {
    return {};
  }
  return { [key]: cert };
}

const redisTls = {
  ...tlsSetup('ca', 'APP_REDIS_CA'),
  ...tlsSetup('cert', 'APP_REDIS_CERT'),
  ...tlsSetup('key', 'APP_REDIS_KEY'),
};

export const redis = {
  ...(Object.keys(redisTls).length ? { tls: redisTls } : {}),
  ...unnestRedisConnectionString(env.or_fail('APP_REDIS_URL')),
};

const postgresTls = {
  ...tlsSetup('ca', 'APP_POSTGRES_CA'),
  ...tlsSetup('cert', 'APP_POSTGRES_CERT'),
  ...tlsSetup('key', 'APP_POSTGRES_KEY'),
};

export const postgres = {
  connectionString: env.or_fail('APP_POSTGRES_URL'),
  // FIXME: add host is a workarround to fix this issue
  // https://github.com/brianc/node-postgres/issues/2263
  ...(Object.keys(postgresTls).length ? { ssl: { ...postgresTls, host: env.or_fail('APP_POSTGRES_HOST') } } : {}),
};
