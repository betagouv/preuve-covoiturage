import { sha256sum } from "@/lib/crypto/index.ts";
import { env, env_or_default } from "@/lib/env/index.ts";
import { exists, getTmpDir } from "@/lib/file/index.ts";
import { errorCode, taggedLogger } from "@/lib/logger/tagged.ts";
import { basename, join } from "@/lib/path/index.ts";
import { mkdir } from "dep:fs-promises";
import { extractFull, SevenZipOptions } from "dep:node-7z";
import { Pool as PgPool, PoolClient as PgPoolClient } from "dep:postgres";
import * as s from "dep:superstruct";

const log = taggedLogger("[flash]", { maxLength: 512 });

type FlashDBDataConfig = {
  connectionString: string;
  dirname: string;
  cache: { url: string; sha: string };
  verbose: boolean;
};

type SetupPaths = { dir: string; arc: string; sql: string; db: string };

export class FlashDBData {
  protected config: FlashDBDataConfig;
  protected archiveFileName: string;
  protected sqlFileName: string;
  protected migrationName: string;
  protected pool: PgPool | null = null;
  protected client: PgPoolClient | null = null;

  constructor(config: Partial<FlashDBDataConfig> = {}) {
    this.config = this.validateConfig(config);
    this.archiveFileName = basename(this.config.cache.url);
    this.sqlFileName = this.archiveFileName.replace(/\.7z$/, "");
    this.migrationName = `flash:${this.sqlFileName}`;
  }

  // ---------------------------------------------------------------------------
  // Public methods
  // ---------------------------------------------------------------------------

  public async missing(): Promise<boolean> {
    return !await this.exists();
  }

  public async exec(): Promise<void> {
    const { dir, arc, sql, db } = await this.setup();
    await this.downloadArchive({ arc });
    await this.extractArchive({ dir, arc, sql });
    await this.restore({ sql, db });
  }

  // ---------------------------------------------------------------------------
  // Private methods
  // ---------------------------------------------------------------------------

  private validateConfig(partial: Partial<FlashDBDataConfig> = {}): FlashDBDataConfig {
    const struct = s.object({
      connectionString: s.defaulted(s.string(), () => env("APP_POSTGRES_URL"), { strict: true }),
      dirname: s.defaulted(
        s.string(),
        () => env_or_default("GEO_CACHE_DIRNAME", `${new Date().getTime()}-geo-schema`),
      ),
      cache: s.object({
        url: s.refine(s.string(), "CacheURL", (value) => {
          if (!value.startsWith("https://")) {
            log.warn("cache url should start with https");
          }

          if (!value.endsWith(".7z")) {
            log.error("cache url should end with 7z");
            return false;
          }

          return true;
        }),
        sha: s.pattern(s.string(), /^[a-f0-9]{64}$/i),
      }),
      verbose: s.defaulted(s.boolean(), () => true),
    });

    const complete = s.create(partial, struct);
    s.assert(complete, struct);

    return complete;
  }

  private async setup(): Promise<SetupPaths> {
    this.config.verbose && log.info("setting up");
    const dir = await this.ensureDestination();
    const arc = await this.ensureArchiveFilePath();
    const sql = await this.ensureSqlFilePath();
    const db = new URL(this.config.connectionString)?.pathname.split("/")[1];

    return { dir, arc, sql, db };
  }

  private async ensureDestination(): Promise<string> {
    const dir = join(getTmpDir(), this.config.dirname);
    await mkdir(dir, { recursive: true });

    return dir;
  }

  private async ensureArchiveFilePath(): Promise<string> {
    return join(await this.ensureDestination(), this.archiveFileName);
  }

  private async ensureSqlFilePath(): Promise<string> {
    return join(await this.ensureDestination(), this.sqlFileName);
  }

  private async downloadArchive({ arc }: Pick<SetupPaths, "arc">): Promise<void> {
    this.config.verbose && log.info("downloading archive");

    // local cache
    if (await exists(arc)) {
      try {
        await this.validateArchive(arc);
        this.config.verbose && log.info("archive in cache, skipping download");
        return;
      } catch {
        this.config.verbose && log.info("archive invalid, downloading again");
      }
    }

    // remote file
    const response = await fetch(this.config.cache.url, { method: "GET", redirect: "follow" });
    if (!response.ok || !response.body) {
      throw new Error(response.statusText);
    }

    // store and validate
    await Deno.writeFile(arc, response.body);
    await this.validateArchive(arc);
  }

  private async extractArchive({ dir, arc, sql }: Omit<SetupPaths, "db">): Promise<void> {
    this.config.verbose && log.info("extracting archive");

    await this.validateArchive(arc);

    if (await exists(sql)) {
      this.config.verbose && log.info("sql file in cache, skipping extraction");
      return;
    }

    await un7zFile(arc, dir);
  }

  private async validateArchive(path: string): Promise<void> {
    if (await sha256sum(path) !== this.config.cache.sha) {
      throw new Error("SHA256 checksum does not match");
    }
  }

  private async restore({ sql, db }: Pick<SetupPaths, "sql" | "db">): Promise<void> {
    try {
      this.config.verbose && log.info("restoring schema");

      this.pool = new PgPool(this.config.connectionString, 10);
      this.client = await this.pool.connect();
      await this.client.queryArray("BEGIN");
      await this.client.queryArray("CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public");
      await this.client.queryArray("COMMIT");
      await this.restoreDump(db, sql);
      await this.save();
    } catch (e) {
      this.client && await this.client.queryArray("ROLLBACK");
      log.error("restore schema failed", { error: errorCode(e), message: e.message });
    } finally {
      this.client && this.client.release();
      this.pool && await this.pool.end();
    }
  }

  private async restoreDump(db: string, sql: string): Promise<void> {
    const cmd = new Deno.Command("pg_restore", { args: ["-xO", "-d", db, sql], stdout: "piped", stderr: "piped" });
    const child = cmd.spawn();
    const { stdout, stderr } = await child.output();

    if (stdout.length) {
      this.config.verbose && log.info("restored dump", { output: new TextDecoder().decode(stdout) });
    }

    if (stderr.length) {
      log.error("restore dump failed", { output: new TextDecoder().decode(stderr) });
    }
  }

  private async save(): Promise<void> {
    const pool = new PgPool(this.config.connectionString, 10);
    const client = await pool.connect();

    try {
      await client.queryArray`INSERT INTO migrations (name, run_on) VALUES (${this.migrationName}, ${new Date()})`;
    } catch (e) {
      log.error("save migration failed", { error: errorCode(e), message: e.message });
      throw e;
    } finally {
      client.release();
      await pool.end();
    }
  }

  private async exists(): Promise<boolean> {
    const pool = new PgPool(this.config.connectionString, 10);
    const client = await pool.connect();

    try {
      const { rowCount } = await client.queryArray`SELECT name FROM migrations WHERE name = ${this.migrationName}`;
      return !!rowCount;
    } catch (e) {
      log.error("find migration failed", { error: errorCode(e), message: e.message });
      throw e;
    } finally {
      client.release();
      await pool.end();
    }
  }
}

function un7zFile(filepath: string, extractPath: string): Promise<void> {
  const bin = env("SEVEN_ZIP_BIN_PATH");
  const options: SevenZipOptions | undefined = bin ? { $bin: bin } : undefined;
  return new Promise((resolve, reject) => {
    const stream = extractFull(filepath, extractPath, options);
    stream.on("end", resolve);
    stream.on("error", reject);
  });
}
