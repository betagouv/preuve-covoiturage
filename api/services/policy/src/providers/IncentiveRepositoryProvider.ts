import { provider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';

import {
  IncentiveInterface,
  IncentiveRepositoryProviderInterface,
  IncentiveRepositoryProviderInterfaceResolver,
} from '../interfaces';

@provider({
  identifier: IncentiveRepositoryProviderInterfaceResolver,
})
export class IncentiveRepositoryProvider implements IncentiveRepositoryProviderInterface {
  public readonly table = 'policy.incentives';

  constructor(protected connection: PostgresConnection) {}

  async create(data: IncentiveInterface): Promise<void> {
    const query = {
      text: `
        INSERT INTO ${this.table} (
          carpool_id,
          policy_id,
          amount,
          status,
          meta
        ) VALUES (
          $1::varchar,
          $2::varchar,
          $3::integer,
          $4,
          $5::json
        )
      `,
      values: [data.carpool_id, data.policy_id, data.amount, data.status || 'validated', data.detail || '{}'],
    };

    const result = await this.connection.getClient().query(query);
    if (result.rowCount !== 1) {
      throw new Error(`Unable to create incentive (${JSON.stringify(data)})`);
    }

    return;
  }

  async createMany(data: IncentiveInterface[]): Promise<void> {
    try {
      await this.connection.getClient().query('BEGIN');

      for (const item of data) {
        await this.create(item);
      }

      await this.connection.getClient().query('COMMIT');
    } catch (e) {
      console.log('Failed Incentive CreateMany: ', e.message);
      await this.connection.getClient().query('ROLLBACK');
    }
  }
}
