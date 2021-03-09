import { Pool, PoolConfig } from 'pg';

import { env } from '@ilos/core';
import { ConnectionInterface } from '@ilos/common';

export class PostgresConnection implements ConnectionInterface<Pool> {
  private readonly pgUrl = env('APP_POSTGRES_URL') as string;
  protected pool: Pool;

  constructor(protected config: PoolConfig) {
    this.pool = new Pool({
      ssl: this.hasSSL(this.pgUrl) ? { rejectUnauthorized: false } : false,
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
