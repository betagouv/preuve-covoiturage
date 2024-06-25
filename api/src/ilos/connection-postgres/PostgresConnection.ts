import type { CursorQueryConfig, PoolConfig } from "@/deps.ts";
import { Cursor, Pool } from "@/deps.ts";
import {
  ConnectionInterface,
  DestroyHookInterface,
  InitHookInterface,
} from "@/ilos/common/index.ts";
import { env } from "@/ilos/core/index.ts";

export enum PgPoolStatus {
  UP = "UP",
  DOWN = "DOWN",
  ERROR = "ERROR",
}

export class PgPool extends Pool {
  protected _status: PgPoolStatus = PgPoolStatus.DOWN;

  constructor(config?: PoolConfig) {
    super(config);

    /**
     * @doc https://node-postgres.com/apis/pool#events
     *
     * acquire: Whenever the pool establishes a new client connection to the
     *          PostgreSQL backend it will emit the connect event with the
     *          newly connected client.
     * error:   When a client is sitting idly in the pool it can still emit
     *          errors because it is connected to a live backend.
     * release: Whenever a client is released back into the pool.
     * remove:  Whenever a client is closed & removed from the pool.
     */
    this.on("acquire", () => {
      this._status = PgPoolStatus.UP;
    });

    this.on("error", (err: Error) => {
      console.error("[pg] pool error", err.message);
      this._status = PgPoolStatus.ERROR;
    });

    this.on("remove", () => {
      const { totalCount, idleCount, waitingCount } = this;
      console.info(
        `[pg] client removed ` +
          `(total: ${totalCount}, idle: ${idleCount}, waiting: ${waitingCount})`,
      );
    });
  }

  get status(): PgPoolStatus {
    return this._status;
  }

  get connected(): boolean {
    return this._status === PgPoolStatus.UP;
  }

  async end(): Promise<void> {
    this._status = PgPoolStatus.DOWN;
    await super.end();
  }
}

export class PostgresConnection
  implements
    ConnectionInterface<PgPool>,
    InitHookInterface,
    DestroyHookInterface {
  private readonly pgUrl: string;
  private database: string = "";
  protected pool: PgPool;
  protected _status: PgPoolStatus = PgPoolStatus.DOWN;

  constructor(protected config: PoolConfig) {
    const timeout = env.or_int("APP_POSTGRES_TIMEOUT", 60000);
    this.pgUrl = config.connectionString || env.or_fail("APP_POSTGRES_URL");
    this.database = new URL(this.pgUrl)?.pathname || "";

    this.pool = new PgPool({
      ssl: this.hasSSL(this.pgUrl) ? { rejectUnauthorized: false } : false,
      statement_timeout: timeout,
      query_timeout: timeout,
      idle_in_transaction_session_timeout: timeout,
      ...config,
    });
  }

  /**
   * Helper to the pool status
   */
  get connected(): boolean {
    return this.pool.connected;
  }

  async init(): Promise<void> {
    await this.up();
  }

  async up(): Promise<void> {
    await this.pool.query("SELECT NOW()");
    console.debug("[pg] connect to", this.database);
  }

  async destroy(): Promise<void> {
    await this.down();
  }

  async down(): Promise<void> {
    console.debug("[pg] disconnect from", this.database);
    this.pool.connected && await this.pool.end();
  }

  getClient(): PgPool {
    return this.pool;
  }

  async getCursor<T = unknown>(
    text: string,
    values: unknown[],
    config: CursorQueryConfig | undefined = undefined,
  ): Promise<{ read: Cursor["read"]; release: () => Promise<void> }> {
    const client = await this.pool.connect();
    const cursor = client.query<Cursor<T>>(new Cursor(text, values, config));

    return {
      read: cursor.read.bind(cursor),
      async release() {
        await cursor.close();
        client.release();
      },
    };
  }

  // https://www.postgresql.org/docs/current/libpq-ssl.html
  private hasSSL(strUrl: string): boolean {
    const url = new URL(strUrl);
    if (!url.searchParams.has("sslmode")) return false;
    return url.searchParams.get("sslmode") !== "disable";
  }
}
