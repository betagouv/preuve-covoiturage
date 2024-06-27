import { Migrator } from "./Migrator.ts";
import { PartialConfigInterface } from "./interfaces/index.ts";
import { config as defaultConfig } from "./config.ts";
import {
  bootstrap,
  createFileManager,
  createLogger,
  createPool,
  createStateManager,
} from "./helpers/index.ts";

export function buildMigrator(
  userConfig: Partial<PartialConfigInterface>,
  shouldBootstrap = false,
): Migrator {
  const FileManager = createFileManager({
    ...defaultConfig.file,
    ...userConfig.file,
  });
  const pool = createPool({ ...defaultConfig.pool, ...userConfig.pool });
  const appConfig = { ...defaultConfig.app, ...userConfig.app };
  const stateManager = createStateManager(pool, appConfig);
  if (shouldBootstrap) {
    const logger = createLogger({
      ...defaultConfig.logger,
      ...userConfig.logger,
    });
    bootstrap(logger, [async () => pool.end()]);
  }
  const migrator = new Migrator(pool, FileManager, appConfig, stateManager);
  return migrator;
}
