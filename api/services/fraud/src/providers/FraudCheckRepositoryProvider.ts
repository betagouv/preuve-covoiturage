import { provider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';

import {
  FraudCheckRepositoryProviderInterface,
  FraudCheckRepositoryProviderInterfaceResolver,
  FraudCheck,
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

  public async findOrCreateFraudCheck<T = any>(acquisitionId: number, method: string): Promise<FraudCheck<T>> {
    const query = {
      text: `
      WITH ins AS (
        INSERT INTO ${this.table} (
          acquisition_id,
          method,
          meta
        ) VALUES ($1::varchar, $2, '{}'::json)
        ON CONFLICT DO NOTHING
        RETURNING _id, status, meta::text, karma
      )
      SELECT _id, status, meta::json, karma FROM (
      (SELECT * FROM ins)
      UNION
      (SELECT 
        _id,
        status,
        meta::text,
        karma
      FROM ${this.table}
      WHERE acquisition_id = $1::varchar
      AND method = $2)) AS foo`,
      values: [acquisitionId, method],
    };

    const result = await this.connection.getClient().query(query);

    if (result.rowCount !== 1) {
      return undefined;
    }
    return result.rows[0];

  }

  public async updateFraudCheck(fraud: FraudCheck): Promise<void> {
    const query = {
      text: `
      UPDATE ${this.table} SET
        status = $2,
        karma = $3,
        meta = $4::json
      WHERE
        _id = $1
      `,
      values: [
        fraud._id,
        fraud.status,
        fraud.karma,
        fraud.meta,
      ]
    };

    const result = await this.connection.getClient().query(query);

    if (result.rowCount !== 1) {
      throw new Error('fraudentry is not existing');
    }

    return;
  }
}
