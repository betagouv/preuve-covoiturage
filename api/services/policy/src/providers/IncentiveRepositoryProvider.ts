import { provider } from '@ilos/common';
import { PostgresConnection, PoolClient } from '@ilos/connection-postgres';

import {
  IncentiveInterface,
  IncentiveRepositoryProviderInterface,
  IncentiveRepositoryProviderInterfaceResolver,
  IncentiveCreateOptionsType,
} from '../interfaces';

@provider({
  identifier: IncentiveRepositoryProviderInterfaceResolver,
})
export class IncentiveRepositoryProvider implements IncentiveRepositoryProviderInterface {
  public readonly table = 'policy.incentives';
  constructor(protected connection: PostgresConnection) {}

  async create(data: IncentiveInterface, options: IncentiveCreateOptionsType = {}): Promise<void> {
    const opts = { connection: null, release: true, ...options };

    if (opts.connection === null) {
      opts.connection = await this.connection.getClient().connect();
    }

    const query = {
      text: `
        INSERT INTO ${this.table} (
          carpool_id,
          policy_id,
          amount,
          status,
          meta
        ) VALUES (
          $1,
          $2,
          $3::integer,
          $4,
          $5::json
        )
      `,
      values: [data.carpool_id, data.policy_id, data.amount, data.status || 'validated', data.detail || '{}'],
    };

    const result = await opts.connection.query(query);
    if (result.rowCount !== 1) {
      throw new Error(`Unable to create incentive (${JSON.stringify(data)})`);
    }

    if (opts.release) {
      opts.connection.release();
    }

    return;
  }

  async createMany(data: IncentiveInterface[]): Promise<void> {
    const conn: PoolClient = await this.connection.getClient().connect();

    try {
      await conn.query('BEGIN');

      for (const item of data) {
        await this.create(item, { connection: conn, release: false });
      }

      await conn.query('COMMIT');
    } catch (e) {
      console.log('Failed Incentive CreateMany: ', e.message);
      await conn.query('ROLLBACK');
    }

    conn.release();
  }
}
