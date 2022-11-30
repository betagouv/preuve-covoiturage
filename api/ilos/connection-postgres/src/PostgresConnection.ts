import { Pool, PoolConfig } from 'pg';
import { URL } from 'url';

import { env } from '@ilos/core';
import { ConnectionInterface } from '@ilos/common';

export class PostgresConnection implements ConnectionInterface<Pool> {
  private readonly pgUrl: string;
  protected pool: Pool;

  constructor(protected config: PoolConfig) {
    this.pgUrl = config.connectionString || env('APP_POSTGRES_URL') as string;
    const timeout = parseInt(env('APP_POSTGRES_TIMEOUT', '60000') as string, 10);

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

  // https://www.postgresql.org/docs/current/libpq-ssl.html
  private hasSSL(strUrl: string): boolean {
    const url = new URL(strUrl);
    if (!url.searchParams.has('sslmode')) return false;
    return url.searchParams.get('sslmode') !== 'disable';
  }
}
