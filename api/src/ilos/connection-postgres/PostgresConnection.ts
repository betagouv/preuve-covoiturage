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

    this.on("acquire", () => {
      this._status = PgPoolStatus.UP;
    });

    this.on("error", (err: Error) => {
      console.error("PgPool error", err.message);
      this._status = PgPoolStatus.ERROR;
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
  protected pool: PgPool;
  protected _status: PgPoolStatus = PgPoolStatus.DOWN;

  constructor(protected config: PoolConfig) {
    this.pgUrl = config.connectionString || env.or_fail("APP_POSTGRES_URL");
    const timeout = env.or_int("APP_POSTGRES_TIMEOUT", 60000);

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
  }

  async destroy(): Promise<void> {
    await this.down();
  }

  async down(): Promise<void> {
    this.pool.connected && await this.pool.end();
  }

  getClient(): PgPool {
    return this.pool;
  }

  async getCursor<T = any>(
    text: string,
    values: any[],
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
