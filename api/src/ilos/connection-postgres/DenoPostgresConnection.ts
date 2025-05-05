import { ConnectionInterface, DestroyHookInterface, InitHookInterface } from "@/ilos/common/index.ts";
import { env_or_default, env_or_false } from "@/lib/env/index.ts";
import { logger } from "@/lib/logger/index.ts";
import sql, { Sql } from "@/lib/pg/sql.ts";
import { ClientOptions, Pool, TransactionOptions } from "dep:postgres";
import { array, assert, boolean, number, object, pattern, refine, string, union } from "dep:superstruct";

export class DenoPostgresConnection implements ConnectionInterface<Pool>, InitHookInterface, DestroyHookInterface {
  #pool: Pool | null = null;
  #poolSize = 3;
  #poolLazy = false;
  #poolConfig: ClientOptions = {};

  /**
   * Generate a unique transaction name
   */
  static id(prefix: "transaction" | "cursor" = "transaction"): string {
    return `${prefix}-${new Date().getTime()}-${Math.random().toString(36).slice(2)}`.toLowerCase();
  }

  constructor(params?: string | ClientOptions | undefined) {
    // Get and parse the config and the connection string
    const { connectionString, config } = this.#configure(params);
    const { hostname, username, password, pathname, port } = new URL(connectionString);

    /**
     * Check or override the TLS certificate
     */
    const certificate: string = env_or_default("APP_POSTGRES_CA", "");
    const forceInsecure: boolean = env_or_false("APP_POSTGRES_INSECURE");
    if (!certificate.length && !forceInsecure) {
      throw new Error("APP_POSTGRES_CA or APP_POSTGRES_INSECURE must be set");
    }

    if (forceInsecure) {
      console.warn("APP_POSTGRES_INSECURE is set, using insecure connection");
    }

    /**
     * Set the pool size
     *
     * @default 3
     */
    this.#poolSize = Number(env_or_default("APP_POSTGRES_POOL_SIZE", "3"));

    /**
     * Set the debugging level for the postgres connection
     *
     * @url https://deno-postgres.com/#/?id=debugging
     *
     * @example
     * APP_POSTGRES_DEBUG=queries,notices,results,queryInError
     * APP_POSTGRES_DEBUG=queries
     * APP_POSTGRES_DEBUG=NOTICES|RESULTS
     */
    const debugString: string = env_or_default("APP_POSTGRES_DEBUG", "").toLocaleLowerCase();

    this.#poolConfig = this.#validateConfig({
      applicationName: "deno-postgres",
      connection: {
        attempts: 1,
      },
      hostname,
      port: Number(port),
      database: pathname.slice(1),
      user: username,
      password,
      tls: {
        enabled: true,
        enforce: forceInsecure ? false : true,
        caCertificates: forceInsecure ? [] : [certificate!],
      },
      controls: {
        debug: debugString === "all" ? true : {
          queries: debugString.includes("queries"),
          notices: debugString.includes("notices"),
          results: debugString.includes("results"),
          queryInError: debugString.includes("queryinerror"),
        },
      },
      ...config,
    });
  }

  get pool(): Pool {
    if (!this.#poolIsValid()) {
      throw new Error("Pool is not initialized");
    }

    return this.#pool!;
  }

  get poolSize(): number {
    return this.#poolSize;
  }

  get poolConfig(): ClientOptions {
    return this.#poolConfig;
  }

  /**
   * Get the pool instance (and not the client)
   *
   * @returns {Pool} The pool instance
   * @deprecated Use connect() instead
   * @example
   * ```ts
   * // deprecated
   * const pool = await connection.getClient();
   * const client = await pool.connect();
   * const result = await client.query("SELECT * FROM users");
   * await client.release();
   *
   * // new way
   * using client = await pool.connect();
   * const result = await client.query("SELECT * FROM users");
   * // client is a Disposable, so it will be released automatically.
   * ```
   */
  getClient(): Pool {
    if (!this.#poolIsValid()) {
      throw new Error("Pool is not initialized");
    }

    return this.#pool!;
  }

  // InitHookInterface mapping
  async init(): Promise<void> {
    await this.up();
  }

  // DestroyHookInterface mapping
  async destroy(): Promise<void> {
    await this.down();
  }

  async up(): Promise<void> {
    if (await this.isReady()) {
      logger.debug(`[pg] already connected to ${this.#poolConfig.database}`);
      return;
    }

    this.#pool = new Pool(this.#poolConfig, this.#poolSize, this.#poolLazy);
    await this.query(sql`SELECT 1`);
    logger.debug(`[pg] connected to ${this.#poolConfig.database}`);
  }

  async down(): Promise<void> {
    this.#pool && await this.#pool.end();
    this.#pool = null;
    logger.debug(`[pg] disconnected from ${this.#poolConfig.database}`);
  }

  async isReady(): Promise<boolean> {
    if (!this.#poolIsValid()) {
      return false;
    }

    return await this.#pool!.initialized() > 0;
  }

  async query<TResult>(sql: Sql): Promise<TResult[]> {
    return this.#wrap<TResult>(sql, "object");
  }

  async queryArray<TResult>(sql: Sql): Promise<TResult[]> {
    return this.#wrap<TResult>(sql, "array");
  }

  async queryObject<TResult>(sql: Sql): Promise<TResult[]> {
    return this.#wrap<TResult>(sql, "object");
  }

  async cursor<TResult>(sql: Sql, transactionConfig: TransactionOptions = {}): Promise<{
    read: (rowCount?: number) => Promise<TResult[]>;
    [Symbol.asyncDispose]: () => Promise<void>;
  }> {
    using client = await this.#pool!.connect();

    // Create a transaction
    const transaction = client.createTransaction(DenoPostgresConnection.id(), {
      isolation_level: "read_committed",
      read_only: true,
      ...transactionConfig,
    });
    await transaction.begin();

    // Create a cursor
    const cursorName = DenoPostgresConnection.id("cursor");
    await transaction.queryArray(`DECLARE ${cursorName} CURSOR FOR ${sql.sql}`, sql.values);

    return {
      read: async (rowCount: number = 100): Promise<TResult[]> => {
        const { rows } = await transaction.queryObject<TResult>(`FETCH FORWARD ${rowCount} FROM ${cursorName}`);
        return rows;
      },
      [Symbol.asyncDispose]: async () => {
        await transaction.queryArray(`CLOSE ${cursorName}`);

        // The transaction has been rolled back on SQL errors, we can safely commit
        await transaction.commit();
      },
    };
  }

  async #wrap<TResult>(sql: Sql, format: "array" | "object"): Promise<TResult[]> {
    // Explicit Resource Management handles the disposal of the client
    using client = await this.#pool!.connect();

    // Create a transaction
    // The transaction is rolled back on SQL errors but stays open on JS errors
    // hence the need to use a try/catch block
    const transaction = client.createTransaction(DenoPostgresConnection.id());

    try {
      await transaction.begin();
      const result = format === "object"
        ? await transaction.queryObject<TResult>({ text: sql.sql, args: sql.values })
        : await transaction.queryArray({ text: sql.sql, args: sql.values }); // FIXME type queryArray !
      await transaction.commit();
      return result.rows as TResult[];
    } catch (e) {
      transaction && await transaction.rollback();
      e instanceof Error && logger.error("[pg] transaction error", e.message);
      throw e;
    }
  }

  #poolIsValid(): boolean {
    return this.#pool !== null && this.#pool instanceof Pool;
  }

  #configure(config: string | ClientOptions | undefined): { connectionString: string; config: ClientOptions } {
    switch (typeof config) {
      case "string":
        return { connectionString: config, config: {} };
      case "object":
      case "undefined": {
        const connectionString = env_or_default("APP_POSTGRES_URL", "");
        if (!connectionString.length) {
          throw new Error("APP_POSTGRES_URL is not set");
        }
        return { connectionString, config: config || {} };
      }
      default:
        throw new Error("Invalid configuration");
    }
  }

  #validateConfig(config: ClientOptions): ClientOptions {
    // Define custom structs for string formats and numerical limits
    const AppName = refine(string(), "AppName", (value: string) => value.length <= 50);
    const Hostname = pattern(string(), /^[a-zA-Z0-9.-]+$/);
    const Database = pattern(string(), /^[a-zA-Z0-9_-]+$/);
    const Username = pattern(string(), /^[a-zA-Z0-9_-]+$/);
    const Port = refine(number(), "Port", (val: number) => val > 0 && val <= 65535);
    const Attempts = refine(number(), "Attempts", (i: number) => i === undefined || (i >= 1 && i <= 10));

    const ClientOptionsStruct = object({
      applicationName: AppName,
      connection: object({ attempts: Attempts }),
      hostname: Hostname,
      port: Port,
      database: Database,
      user: Username,
      password: string(),
      tls: object({
        enabled: boolean(),
        enforce: boolean(),
        caCertificates: array(string()),
      }),
      controls: object({
        debug: union([
          boolean(),
          object({
            queries: boolean(),
            notices: boolean(),
            results: boolean(),
            queryInError: boolean(),
          }),
        ]),
      }),
    });

    assert(config, ClientOptionsStruct);

    return config;
  }
}
