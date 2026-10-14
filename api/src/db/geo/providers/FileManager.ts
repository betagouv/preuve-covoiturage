import { ConfigStore } from "@/ilos/core/extensions/index.ts";
import { createHash, sha256sum } from "@/lib/crypto/index.ts";
import { remove } from "@/lib/file/index.ts";
import { errorCode, taggedLogger } from "@/lib/logger/tagged.ts";
import { basename, join } from "@/lib/path/index.ts";
import { v4 as uuidV4 } from "@/lib/uuid/index.ts";
import { BucketName, S3StorageProvider } from "@/pdc/providers/storage/index.ts";
import { access, mkdir } from "dep:fs-promises";
import mapshaper from "dep:mapshaper";
import { getAllFiles, getFileExtensions, un7zFile, ungzFile, unzipFile, writeFile } from "../helpers/index.ts";
import { FileResource } from "../interfaces/FileManagerInterface.ts";
import {
  ArchiveFileTypeEnum,
  FileManagerConfigInterface,
  FileManagerInterface,
  FileTypeEnum,
  MirrorAclEnum,
} from "../interfaces/index.ts";

const log = taggedLogger("[geo-import]", { maxLength: 512 });

export class FileManager implements FileManagerInterface {
  readonly basePath: string;
  readonly downloadPath: string;
  readonly mirrorUrl: string | undefined;
  readonly mirrorAcl: MirrorAclEnum;
  protected isReady = false;

  constructor(config: FileManagerConfigInterface) {
    this.basePath = config.basePath;
    this.downloadPath = config.downloadPath || join(config.basePath, "download");
    this.mirrorUrl = config.mirrorUrl;
    this.mirrorAcl = config.mirrorAcl;
  }

  async download({ url, sha256 }: FileResource): Promise<string> {
    log.info("downloading", { url });

    const filepath = await this.getTemporaryFilePath(url, true);

    await this.ensureDirPath();

    if (await this.fileExists(filepath)) {
      try {
        await this.check(filepath, sha256);
        log.info("file already exists", { file: filepath });
        return filepath;
      } catch {
        await this.clear(filepath);
      }
    }

    // Download from mirror or fallback to direct download
    try {
      await this.retrieveFromCache(filepath, url, sha256);
    } catch (e) {
      log.info("cache failed, trying direct download", { error: errorCode(e), message: e.message });
      await this.downloadAndCache(filepath, url, sha256);
    }

    return filepath;
  }

  async extract(filepath: string, archiveType: ArchiveFileTypeEnum, fileType: FileTypeEnum): Promise<string[]> {
    try {
      await this.ensureDirPath();
      await access(filepath);
      const extractPath = filepath.replace("/download/", "/extract/");

      log.info("extracting", { file: extractPath });

      try {
        await access(extractPath);
      } catch {
        await mkdir(extractPath, { recursive: true });
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

      log.info("extracted", { count: files.size });

      return [...files];
    } catch (err) {
      log.error("extract failed", { error: errorCode(err), message: (err as Error).message });
      throw err;
    }
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
      log.debug("running mapshaper", { options: options.join(" ") });
      await mapshaper.runCommands(options.join(" "));
      return outFilepath;
    } catch (err) {
      log.error("transform failed", { error: errorCode(err), message: (err as Error).message });
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

    log.info("downloading from mirror", { url: mirror });

    const response = await fetch(mirror, { method: "GET", redirect: "follow" });

    if (!response.ok || !response.body) {
      throw new Error(response.statusText);
    }

    await this.save(destination, response.body);
    await this.check(destination, sha256);

    log.info("mirror download ok");
  }

  protected async downloadAndCache(destination: string, url: string, sha256: string | undefined): Promise<void> {
    log.info("downloading", { url });

    const response = await fetch(url, { method: "GET", redirect: "follow" });

    if (!response.ok || !response.body) {
      throw new Error(`Failed to download ${url}: ${response.statusText}`);
    }

    await this.save(destination, response.body);
    await this.check(destination, sha256);
    await this.cache(destination);

    log.info("direct download ok");
  }

  protected async cache(destination: string): Promise<void> {
    if (this.mirrorAcl !== MirrorAclEnum.READ_WRITE) {
      log.warn("no write permission to cache dataset");
      return;
    }

    log.info("caching", { file: destination });

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

      log.info("file cached", { key });
    } catch (e) {
      log.error("caching failed", { error: errorCode(e), message: e.message });
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
      log.warn("no mirror url provided");
      return;
    }

    return `${this.mirrorUrl}/${await createHash(url)}`;
  }

  protected async clear(filepath: string): Promise<void> {
    await remove(filepath);
  }

  protected async save(destination: string, stream: ReadableStream<Uint8Array>): Promise<void> {
    await writeFile(destination, stream);
    log.info("saved", { file: destination });
  }

  protected async check(data: string | ReadableStream<Uint8Array>, sha256: string | undefined): Promise<void> {
    if (typeof sha256 === "undefined" || sha256 === "") return;
    if (await sha256sum(data) !== sha256) {
      throw new Error("SHA256 checksum does not match");
    }
  }
}
