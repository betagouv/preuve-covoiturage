#!/usr/bin/env node
import { Command, InvalidArgumentError } from "@/deps.ts";
import { args } from "@/lib/cli/index.ts";
import { logger } from "@/lib/logger/index.ts";
import { exit } from "@/lib/process/index.ts";
import {
  buildMigrator,
  defaultConfig,
  Migrator,
  PartialConfigInterface,
} from "./index.ts";

interface Options {
  url: string;
  user: string;
  password: string;
  host: string;
  port: number;
  database: string;
  schema: string;
  directory: string;
  verbose: string;
  cleanup: boolean;
}

function verbosity(value: string): string {
  const levels = ["log", "debug", "info", "warn", "error"];
  if (levels.indexOf(value) < 0) {
    throw new InvalidArgumentError(`Should be one of ${levels.join(", ")}`);
  }
  return value;
}

function parseInteger(value: string): number {
  const parsedValue = parseInt(value, 10);
  if (isNaN(parsedValue)) {
    throw new InvalidArgumentError("Not a number.");
  }
  return parsedValue;
}

function getMigrator(options: Partial<Options>): Migrator {
  const config: Partial<PartialConfigInterface> = {
    pool: {
      ...(options.url && options.url.length
        ? {
          connectionString: options.url,
          user: undefined,
          password: undefined,
          host: undefined,
          port: undefined,
          database: undefined,
        }
        : {
          connectionString: undefined,
          user: options.user,
          password: options.password || defaultConfig.pool.password,
          host: options.host,
          port: options.port,
          database: options.database,
        }),
    },
    logger: {
      level: options.verbose,
    },
    app: {
      targetSchema: options.schema,
      noCleanup: !options.cleanup,
    },
    file: {
      basePath: options.directory,
    },
  };
  const migrator = buildMigrator(config, true);
  return migrator;
}

async function importAction(opts: Partial<Options>) {
  const migrator = getMigrator(opts);
  await migrator.prepare();
  await migrator.run();
}

async function statusAction(opts: Partial<Options>) {
  const migrator = getMigrator(opts);
  await migrator.prepare();
  const done = await migrator.getDone();
  const todo = await migrator.getTodo();
  logger.info([
    ...done.map((mig) => ({ name: mig.uuid, done: true })),
    ...todo.map((mig) => ({ name: mig.uuid, done: false })),
  ]);
}
async function main(): Promise<void> {
  const command = new Command();
  command
    .name("EvolutionGeo")
    .description("Importe les datasets géographique par millésime")
    .option(
      "--url <url>",
      "Postgresql url, default to env POSTGRES_URL",
      defaultConfig.pool.connectionString,
    )
    .option(
      "-u, --user <user>",
      "Postgresql user, default to env POSTGRES_USER",
      defaultConfig.pool.user,
    )
    .option(
      "-W, --password <password>",
      "Postgresql password, default to env POSTGRES_PASSWORD",
    )
    .option(
      "-H, --host <host>",
      "Postgresql host, default to env POSTGRES_HOST",
      defaultConfig.pool.host,
    )
    .option(
      "-p, --port <port>",
      "Postgresql port, default to env POSTGRES_PORT",
      parseInteger,
      defaultConfig.pool.port ? defaultConfig.pool.port : 5432,
    )
    .option(
      "-d, --database <database>",
      "Postgresql database, default to env POSTGRES_DB",
      defaultConfig.pool.database,
    )
    .option(
      "-S, --schema <schema>",
      "Postgresql schema, default to env POSTGRES_SCHEMA",
      defaultConfig.app.targetSchema,
    )
    .option(
      "-d, --directory <directory>",
      "Path to download directory, default to env CACHE_DIRECTORY or os temporary directory if env missing",
      defaultConfig.file.basePath,
    )
    .option(
      "-v, --verbose <level>",
      "Verbosity, default to env LOG_LEVEL",
      verbosity,
      "error",
    );

  command
    .command("import")
    .description("Import datasets")
    .option("--no-cleanup", "Disable cleanup")
    .action((localOpts) => importAction({ ...localOpts, ...command.opts() }));

  command
    .command("status")
    .description("Get import status")
    .action((localOpts) => statusAction({ ...localOpts, ...command.opts() }));

  command.parseAsync(args());
}

main().catch((e) => {
  logger.error(e);
  exit(1);
});
