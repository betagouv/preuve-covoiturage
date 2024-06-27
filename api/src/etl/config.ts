import { readFileSync } from "@/deps.ts";
import {
  env,
  env_or_default,
  env_or_fail,
  env_or_int,
} from "@/lib/env/index.ts";
import { getTmpDir } from "@/lib/file/index.ts";
import { datasets, datastructures } from "./datasets.ts";
import { ConfigInterface } from "./interfaces/ConfigInterface.ts";

function tlsSetup(key: string, baseEnvKey: string): { [k: string]: string } {
  const asVarEnvName = baseEnvKey;
  const asPathEnvName = `${baseEnvKey}_PATH`;

  let cert: string;
  let envContent: string;
  if (env(asVarEnvName)) {
    envContent = env_or_default(asVarEnvName, "");
    cert = envContent.toString().replace(/\\n/g, "\n");
  } else if (env(asPathEnvName)) {
    envContent = env_or_default(asPathEnvName, "");
    cert = readFileSync(envContent.toString(), "utf-8");
  } else {
    return {};
  }
  return { [key]: cert };
}

const postgresTls = {
  ...tlsSetup("ca", "POSTGRES_CA"),
  ...tlsSetup("cert", "POSTGRES_CERT"),
  ...tlsSetup("key", "POSTGRES_KEY"),
};

export const config: ConfigInterface = {
  pool: {
    connectionString: env_or_fail("POSTGRES_URL"),
    user: env_or_default("POSTGRES_USER", "postgres"),
    password: env_or_default("POSTGRES_PASSWORD", "postgres"),
    database: env_or_default("POSTGRES_DB", "local"),
    host: env_or_default("POSTGRES_HOST", "127.0.0.1"),
    port: env_or_int("POSTGRES_PORT", 5432),
    ...(Object.keys(postgresTls).length ? { ssl: postgresTls } : {}),
  },
  logger: {
    level: env_or_default("LOG_LEVEL", "debug"),
  },
  file: {
    basePath: env_or_default("CACHE_DIRECTORY", getTmpDir()),
    downloadPath: env("DOWNLOAD_DIRECTORY"),
    mirrorUrl: env("MIRROR_URL"),
  },
  app: {
    noCleanup: false,
    targetSchema: env_or_default("POSTGRES_SCHEMA", "public"),
    datasets,
    datastructures,
    sevenZipBinPath: env("SEVEN_ZIP_BIN_PATH"),
  },
};
