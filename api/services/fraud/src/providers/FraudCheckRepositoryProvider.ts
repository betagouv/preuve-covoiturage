import { provider, NotFoundException } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';

import {
  FraudCheckRepositoryProviderInterface,
  FraudCheckRepositoryProviderInterfaceResolver,
  FraudCheckEntry,
} from '../interfaces';

/*
 * Trip specific repository
 */
@provider({
  identifier: FraudCheckRepositoryProviderInterfaceResolver,
})
export class FraudCheckRepositoryProvider implements FraudCheckRepositoryProviderInterface {
  public readonly table = 'fraudcheck.fraudchecks';

  constructor(public connection: PostgresConnection) {}

  public async get(acquisitionId: number): Promise<FraudCheckEntry> {
    const query = {
      text: `
        WITH data AS (
          SELECT $1::int as acquisition_id
        )
        SELECT
            d.acquisition_id,
            t.status,
            t.karma,
            t.data::json[]
          FROM data as d
          LEFT JOIN ${this.table} as t
            ON d.acquisition_id = t.acquisition_id
          LIMIT 1
        `,
      values: [acquisitionId],
    };

    const result = await this.connection.getClient().query(query);

    if (result.rowCount !== 1) {
      throw new NotFoundException();
    }
    return result.rows[0];
  }

  public async createOrUpdate(data: FraudCheckEntry): Promise<void> {
    const query = {
      text: `
        INSERT INTO ${this.table} (
          acquisition_id,
          status,
          karma,
          data
        ) VALUES (
          $1::int,
          $2::fraudcheck.status_enum,
          $3::float,
          $4::json::fraudcheck.result[]
        )
        ON CONFLICT (acquisition_id)
        DO UPDATE SET (
          status,
          karma,
          data
        ) = (
          excluded.status,
          excluded.karma,
          excluded.data
        )
      `,
      values: [data.acquisition_id, data.status, data.karma, JSON.stringify(data.data)],
    };

    await this.connection.getClient().query(query);
    return;
  }
}
