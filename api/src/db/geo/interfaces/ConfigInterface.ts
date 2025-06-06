import { PoolConfig } from "dep:pg";
import { StaticAbstractDataset, StaticMigrable } from "./index.ts";

export interface AppConfigInterface {
  targetSchema: string;
  noCleanup: boolean;
  datasets: Set<StaticAbstractDataset>;
  datastructures: Set<StaticMigrable>;
  sevenZipBinPath?: string;
}

export enum MirrorAclEnum {
  READ = "r",
  READ_WRITE = "rw",
}

export interface FileManagerConfigInterface {
  basePath: string;
  downloadPath?: string;
  mirrorAcl: MirrorAclEnum;
  mirrorUrl?: string;
  archivesUrl?: string;
}

export interface LoggerConfigInterface {
  level: string;
}
export interface ConfigInterface {
  pool: PoolConfig;
  logger: LoggerConfigInterface;
  file: FileManagerConfigInterface;
  app: AppConfigInterface;
}

export interface PartialConfigInterface {
  pool: Partial<PoolConfig>;
  logger: Partial<LoggerConfigInterface>;
  file: Partial<FileManagerConfigInterface>;
  app: Partial<AppConfigInterface>;
}
