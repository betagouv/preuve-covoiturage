import { ArchiveFileTypeEnum, FileTypeEnum } from "./index.ts";

export interface FileManagerInterface {
  install(): Promise<void>;
  decompress(
    filepath: string,
    archiveType: ArchiveFileTypeEnum,
    fileType: FileTypeEnum,
  ): Promise<string[]>;
  download(url: string): Promise<string>;
  transform(
    filepath: string,
    format: string,
    precision: number,
    force: boolean,
    simplify?: string,
  ): Promise<string>;
}
