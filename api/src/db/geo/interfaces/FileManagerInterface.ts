import { ArchiveFileTypeEnum, FileTypeEnum } from "./index.ts";

export type FileResource = {
  url: string;
  sha256?: string;
};

export interface FileManagerInterface {
  ensureDirPath(): Promise<void>;
  extract(filepath: string, archiveType: ArchiveFileTypeEnum, fileType: FileTypeEnum): Promise<string[]>;
  download(src: FileResource): Promise<string>;
  transform(filepath: string, format: string, precision: number, force: boolean, simplify?: string): Promise<string>;
}
