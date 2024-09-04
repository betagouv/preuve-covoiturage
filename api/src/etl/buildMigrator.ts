import { Migrator } from "./Migrator.ts";
import { config as defaultConfig } from "./config.ts";
import {
  bootstrap,
  createFileManager,
  createPool,
  createStateManager,
} from "./helpers/index.ts";
import { PartialConfigInterface } from "./interfaces/index.ts";

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
    bootstrap([async () => pool.end()]);
  }
  const migrator = new Migrator(pool, FileManager, appConfig, stateManager);
  return migrator;
}
