import { Pool, PoolConfig } from 'pg';

import { ConnectionInterface } from '@ilos/common';

export class PostgresConnection implements ConnectionInterface<Pool> {
  protected pool: Pool;

  constructor(protected config: PoolConfig) {
    this.pool = new Pool(config);
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
}
