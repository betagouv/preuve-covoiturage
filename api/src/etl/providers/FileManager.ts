import { access, mapshaper, mkdir } from "@/deps.ts";
import { createHash, sha256sum } from "@/lib/crypto/index.ts";
import fetcher from "@/lib/fetcher/index.ts";
import { logger } from "@/lib/logger/index.ts";
import { basename, join } from "@/lib/path/index.ts";
import { v4 as uuidV4 } from "@/lib/uuid/index.ts";
import { getAllFiles, getFileExtensions, un7zFile, ungzFile, unzipFile, writeFile } from "../helpers/index.ts";
import {
  ArchiveFileTypeEnum,
  FileManagerConfigInterface,
  FileManagerInterface,
  FileTypeEnum,
} from "../interfaces/index.ts";

export class FileManager implements FileManagerInterface {
  readonly basePath: string;
  readonly downloadPath: string;
  readonly mirrorUrl: string | undefined;
  protected isReady = false;

  constructor(config: FileManagerConfigInterface) {
    this.basePath = config.basePath;
    this.downloadPath = config.downloadPath || join(config.basePath, "download");
    this.mirrorUrl = config.mirrorUrl;
  }

  protected async getTemporaryDirectoryPath(name?: string): Promise<string> {
    return name ? join(this.basePath, name) : await this.getTemporaryFilePath();
  }

  protected async getTemporaryFilePath(
    data?: string,
    isDownload = false,
  ): Promise<string> {
    return join(
      isDownload ? this.downloadPath : this.basePath,
      data ? await createHash(data) : uuidV4(),
    );
  }

  protected async getMirrorUrl(url: string): Promise<string | undefined> {
    if (!this.mirrorUrl) {
      return;
    }
    return `${this.mirrorUrl}/${await createHash(url)}`;
  }

  async install(): Promise<void> {
    if (this.isReady) {
      return;
    }

    for (const path of [this.basePath, this.downloadPath]) {
      try {
        await access(path);
      } catch {
        await mkdir(path, { recursive: true });
      }
    }
    this.isReady = true;
  }

  async decompress(
    filepath: string,
    archiveType: ArchiveFileTypeEnum,
    fileType: FileTypeEnum,
  ): Promise<string[]> {
    try {
      await this.install();
      await access(filepath);
      const extractPath = await this.getTemporaryDirectoryPath(
        `${basename(filepath)}-extract`,
      );
      try {
        await access(extractPath);
      } catch {
        // If directory not found, create it and decompress
        await mkdir(extractPath);
        switch (archiveType) {
          case ArchiveFileTypeEnum.Zip:
            await unzipFile(filepath, extractPath);
            break;
          case ArchiveFileTypeEnum.GZip:
            await ungzFile(filepath, extractPath);
            break;
          case ArchiveFileTypeEnum.SevenZip:
            await un7zFile(filepath, extractPath);
            break;
          case ArchiveFileTypeEnum.None:
            break;
          default:
            throw new Error();
        }
      }
      const files: Set<string> = new Set();
      await getAllFiles(extractPath, getFileExtensions(fileType), files);
      return [...files];
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }

  async download(url: string, sha256?: string): Promise<string> {
    const filepath = await this.getTemporaryFilePath(url, true);
    await this.install();
    try {
      await access(filepath);
    } catch (_e) {
      // If file not found download it !
      try {
        const response = await fetcher.get(url);
        if (!response.body) {
          throw new Error(`Failed to download ${url}`);
        }
        await this.checkSignature(response.body, sha256);
        await writeFile(response.body, filepath);
      } catch (e) {
        // If not found and have mirror, try download
        const mirrorUrl = await this.getMirrorUrl(url);
        if (mirrorUrl) {
          const response = await fetcher.get(mirrorUrl);
          if (!response.body) {
            throw new Error(`Failed to download from mirror: ${url}`);
          }
          await this.checkSignature(response.body, sha256);
          await writeFile(response.body, filepath);
        } else {
          throw e;
        }
      }
    }
    return filepath;
  }

  async transform(
    filepath: string,
    format: string,
    precision: number,
    force: boolean,
    simplify?: string,
  ): Promise<string> {
    try {
      const outFilepath = `${await this.getTemporaryFilePath()}.${format}`;
      const options = [
        "-i",
        filepath,
        simplify || "",
        "-o",
        force ? "force" : "",
        outFilepath,
        `format=${format}`,
        `precision=${precision}`,
      ];
      logger.debug(`Running mapshaper with options ${options.join(" ")}`);
      await mapshaper.runCommands(options.join(" "));
      return outFilepath;
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }

  protected async checkSignature(data: ReadableStream<Uint8Array>, sha256: string | undefined): Promise<void> {
    if (typeof sha256 === "undefined" || sha256 === "") return;
    if (await sha256sum(data) !== sha256) {
      throw new Error("SHA256 checksum does not match");
    }
  }
}
