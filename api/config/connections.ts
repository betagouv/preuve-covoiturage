import { readFileSync } from 'fs';
import { env } from '@ilos/core';

function tlsSetup(key: string, baseEnvKey: string): { [k: string]: string } {
  const asVarEnvName = baseEnvKey;
  const asPathEnvName = `${baseEnvKey}_PATH`;

  let cert: string;
  if (asVarEnvName in process.env) {
    cert = env(asVarEnvName).toString().replace(/\\n/g, '\n');
  } else if (asPathEnvName in process.env) {
    cert = readFileSync(env(asPathEnvName) as string, 'utf-8');
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
  connectionString: env('APP_REDIS_URL') as string,
  ...(Object.keys(redisTls).length ? { tls: redisTls } : {}),
};

const postgresTls = {
  ...tlsSetup('ca', 'APP_POSTGRES_CA'),
  ...tlsSetup('cert', 'APP_POSTGRES_CERT'),
  ...tlsSetup('key', 'APP_POSTGRES_KEY'),
};

export const postgres = {
  connectionString: env('APP_POSTGRES_URL') as string,
  ...(Object.keys(postgresTls).length ? { ssl: postgresTls } : {}),
};
