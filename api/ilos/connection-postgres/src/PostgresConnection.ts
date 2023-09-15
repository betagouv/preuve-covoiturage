import { Pool, PoolConfig } from 'pg';
import Cursor, { CursorQueryConfig } from 'pg-cursor';
import { URL } from 'url';

import { ConnectionInterface } from '@ilos/common';
import { env } from '@ilos/core';

export class PostgresConnection implements ConnectionInterface<Pool> {
  private readonly pgUrl: string;
  protected pool: Pool;

  constructor(protected config: PoolConfig) {
    this.pgUrl = config.connectionString || env.or_fail('APP_POSTGRES_URL');
    const timeout = env.or_int('APP_POSTGRES_TIMEOUT', 60000);

    this.pool = new Pool({
      ssl: this.hasSSL(this.pgUrl) ? { rejectUnauthorized: false } : false,
      statement_timeout: timeout,
      query_timeout: timeout,
      idle_in_transaction_session_timeout: timeout,
      ...config,
    });
  }

  async up() {
    await this.pool.query('SELECT NOW()');
    return;
  }

  async down() {
    await this.pool.end();
  }

  getClient(): Pool {
    return this.pool;
  }

  async getCursor<T = any>(
    text: string,
    values: any[],
    config: CursorQueryConfig = undefined,
  ): Promise<{ read: Cursor['read']; release: () => Promise<void> }> {
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
    if (!url.searchParams.has('sslmode')) return false;
    return url.searchParams.get('sslmode') !== 'disable';
  }
}
