import { provider, NotFoundException } from '@ilos/common';
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
          amount
          status,
          meta
        ) VALUES (
          $1,
          $2,
          $3,
          $4,
          $5
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
}
