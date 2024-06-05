import os from 'node:os';
import { readFileSync } from 'node:fs';
import { datasets, datastructures } from './datasets.ts';
import { ConfigInterface } from './interfaces/ConfigInterface.ts';
import process from 'node:process';

function tlsSetup(key: string, baseEnvKey: string): { [k: string]: string } {
  const asVarEnvName = baseEnvKey;
  const asPathEnvName = `${baseEnvKey}_PATH`;

  let cert: string;
  let envContent: string;
  if (asVarEnvName in process.env) {
    envContent = process.env[asVarEnvName] || '';
    cert = envContent.toString().replace(/\\n/g, '\n');
  } else if (asPathEnvName in process.env) {
    envContent = process.env[asPathEnvName] || '';
    cert = readFileSync(envContent.toString(), 'utf-8');
  } else {
    return {};
  }
  return { [key]: cert };
}

const postgresTls = {
  ...tlsSetup('ca', 'POSTGRES_CA'),
  ...tlsSetup('cert', 'POSTGRES_CERT'),
  ...tlsSetup('key', 'POSTGRES_KEY'),
};

export const config: ConfigInterface = {
  pool: {
    connectionString: process.env.POSTGRES_URL,
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    database: process.env.POSTGRES_DB || 'local',
    host: process.env.POSTGRES_HOST || '127.0.0.1',
    port: process.env.POSTGRES_PORT ? parseInt(process.env.POSTGRES_PORT, 10) : 5432,
    ...(Object.keys(postgresTls).length ? { ssl: postgresTls } : {}),
  },
  logger: {
    level: process.env.LOG_LEVEL || 'debug',
  },
  file: {
    basePath: process.env.CACHE_DIRECTORY || os.tmpdir(),
    downloadPath: process.env.DOWNLOAD_DIRECTORY,
    mirrorUrl: process.env.MIRROR_URL,
  },
  app: {
    noCleanup: false,
    targetSchema: process.env.POSTGRES_SCHEMA || 'public',
    datasets,
    datastructures,
    sevenZipBinPath: process.env.SEVEN_ZIP_BIN_PATH,
  },
};
