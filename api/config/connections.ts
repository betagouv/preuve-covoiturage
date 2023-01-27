import { readFileSync } from 'fs';
import { env } from '@ilos/core';

function tlsSetup(key: string, baseEnvKey: string): { [k: string]: string } {
  if(baseEnvKey in process.env) {
    const file = env(baseEnvKey) as string;
    return { [key]: file };
  }
  const envKey = `${baseEnvKey}_PATH`;
  if(!(envKey in process.env)) {
     return {};
  }
  const filePath = env(envKey) as string;
  const file = readFileSync(filePath, 'utf-8');
  return { [key]: file };
}

const redisTls = {
  ...tlsSetup('ca', 'APP_REDIS_CA'),
  ...tlsSetup('cert', 'APP_REDIS_CERT'),
  ...tlsSetup('key', 'APP_REDIS_KEY'),
};

export const redis = {
  connectionString: env('APP_REDIS_URL'),
  ...(Object.keys(redisTls).length ? { tls: redisTls } : {}),
};

const postgresTls = {
  ...tlsSetup('ca', 'APP_POSTGRES_CA'),
  ...tlsSetup('cert', 'APP_POSTGRES_CERT'),
  ...tlsSetup('key', 'APP_POSTGRES_KEY'),
};

export const postgres = {
  connectionString: env('APP_POSTGRES_URL'),
  ...(Object.keys(postgresTls).length ? { ssl: postgresTls } : {}),
};

console.log({ redis, postgres });