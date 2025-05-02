import { ConnectionInterface, DestroyHookInterface, InitHookInterface } from "@/ilos/common/index.ts";
import { env_or_default, env_or_fail, env_or_false } from "@/lib/env/index.ts";
import { logger } from "@/lib/logger/index.ts";
import { ClientOptions, Pool } from "dep:postgres";

export class DenoPostgreConnection implements ConnectionInterface<Pool>, InitHookInterface, DestroyHookInterface {
  #pool: Pool;
  #poolSize = 3;
  #poolLazy = false;
  #poolConfig: ClientOptions = {};

  constructor(config: ClientOptions) {
    // Get and parse the connection string
    const connectionString: string = env_or_fail("APP_POSTGRES_URL");
    const { hostname, username, password, pathname, port } = new URL(connectionString!);

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

    this.#poolConfig = {
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
        debug: {
          queries: debugString.includes("queries"),
          notices: debugString.includes("notices"),
          results: debugString.includes("results"),
          queryInError: debugString.includes("queryInError"),
        },
      },
      ...config,
    };
  }

  async up(): Promise<void> {
    this.#pool = new Pool(this.#poolConfig, this.#poolSize, this.#poolLazy);
    logger.debug(`[pg] connected to ${this.#poolConfig.database}`);
  }

  async down(): Promise<void> {
    await this.#pool.end();
    logger.debug(`[pg] disconnected from ${this.#poolConfig.database}`);
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
    return this.#pool;
  }

  async init(): Promise<void> {
    await this.up();
  }

  async destroy(): Promise<void> {
    await this.down();
  }
}
