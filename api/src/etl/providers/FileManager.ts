import { access, mapshaper, mkdir } from "@/deps.ts";
import { FileResource } from "@/etl/interfaces/FileManagerInterface.ts";
import { ConfigStore } from "@/ilos/core/extensions/index.ts";
import { createHash, sha256sum } from "@/lib/crypto/index.ts";
import { remove } from "@/lib/file/index.ts";
import { logger } from "@/lib/logger/index.ts";
import { basename, join } from "@/lib/path/index.ts";
import { v4 as uuidV4 } from "@/lib/uuid/index.ts";
import { BucketName, S3StorageProvider } from "@/pdc/providers/storage/index.ts";
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

  async decompress(filepath: string, archiveType: ArchiveFileTypeEnum, fileType: FileTypeEnum): Promise<string[]> {
    try {
      await this.ensureDirPath();
      await access(filepath);
      const extractPath = await this.getTmpPath(`${basename(filepath)}-extract`);

      logger.info(`Extracting ${filepath} to ${extractPath}`);

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
            throw new Error(`Unsupported archive type: ${archiveType}`);
        }
      }

      const files: Set<string> = new Set();
      await getAllFiles(extractPath, getFileExtensions(fileType), files);

      logger.info(`Extracted ${files.size} files`, [...files]);

      return [...files];
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }

  async download({ url, sha256 }: FileResource): Promise<string> {
    const filepath = await this.getTemporaryFilePath(url, true);

    await this.ensureDirPath();

    if (await this.fileExists(filepath)) {
      try {
        await this.check(filepath, sha256);
        logger.info(`File already exists: ${filepath}`);
        return filepath;
      } catch {
        await this.clear(filepath);
      }
    }

    // Download from mirror or fallback to direct download
    try {
      await this.retrieveFromCache(filepath, url, sha256);
    } catch (e) {
      logger.info(`Cache failed (${e.message}), Trying direct download`);
      await this.downloadAndCache(filepath, url, sha256);
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

  async ensureDirPath(): Promise<void> {
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

  protected async fileExists(filepath: string): Promise<boolean> {
    try {
      await access(filepath);
      return true;
    } catch {
      return false;
    }
  }

  protected async retrieveFromCache(destination: string, url: string, sha256: string | undefined): Promise<void> {
    const mirror = await this.getMirrorUrl(url);
    if (!mirror) {
      throw new Error("No mirror URL provided");
    }

    logger.info(`Downloading from mirror ${mirror}`);

    const response = await fetch(mirror, { method: "GET", redirect: "follow" });

    if (!response.ok || !response.body) {
      throw new Error(response.statusText);
    }

    await this.save(destination, response.body);
    await this.check(destination, sha256);

    logger.info("Downloading from mirror OK");
  }

  protected async downloadAndCache(destination: string, url: string, sha256: string | undefined): Promise<void> {
    logger.info(`Downloading ${url}`);

    const response = await fetch(url, { method: "GET", redirect: "follow" });

    if (!response.ok || !response.body) {
      throw new Error(`Failed to download ${url}: ${response.statusText}`);
    }

    await this.save(destination, response.body);
    await this.check(destination, sha256);
    await this.cache(destination);

    logger.info("Direct downloading OK");
  }

  protected async cache(destination: string): Promise<void> {
    logger.info(`Caching ${destination}`);

    try {
      const s3 = new S3StorageProvider(new ConfigStore({}));
      await s3.init();
      const filename = basename(destination);
      const key = await s3.upload(BucketName.GeoDatasetsMirror, destination, filename, undefined, {
        prefix: "",
        metadata: {
          "x-amz-acl": "public-read",
        },
      });

      logger.info(`File cached: ${key}`);
    } catch (e) {
      logger.error(`Caching failed: ${e.message}`);
    }
  }

  protected async getTmpPath(name?: string): Promise<string> {
    return name ? join(this.basePath, name) : await this.getTemporaryFilePath();
  }

  protected async getTemporaryFilePath(data?: string, isDownload = false): Promise<string> {
    return join(
      isDownload ? this.downloadPath : this.basePath,
      data ? await createHash(data) : uuidV4(),
    );
  }

  protected async getMirrorUrl(url: string): Promise<string | undefined> {
    if (!this.mirrorUrl) {
      logger.warn("No mirror URL provided");
      return;
    }

    return `${this.mirrorUrl}/${await createHash(url)}`;
  }

  protected async clear(filepath: string): Promise<void> {
    await remove(filepath);
  }

  protected async save(destination: string, stream: ReadableStream<Uint8Array>): Promise<void> {
    await writeFile(destination, stream);
    logger.info(`Saved to ${destination}`);
  }

  protected async check(data: string | ReadableStream<Uint8Array>, sha256: string | undefined): Promise<void> {
    if (typeof sha256 === "undefined" || sha256 === "") return;
    if (await sha256sum(data) !== sha256) {
      throw new Error("SHA256 checksum does not match");
    }
  }
}
