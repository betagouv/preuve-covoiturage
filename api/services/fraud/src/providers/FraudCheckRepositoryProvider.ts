import { provider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';

import {
  FraudCheckRepositoryProviderInterface,
  FraudCheckRepositoryProviderInterfaceResolver,
  FraudCheck,
} from '../interfaces';
import { UncompletedTestException } from '../exceptions/UncompletedTestException';

/*
 * Trip specific repository
 */
@provider({
  identifier: FraudCheckRepositoryProviderInterfaceResolver,
})
export class FraudCheckRepositoryProvider implements FraudCheckRepositoryProviderInterface {
  public readonly table = 'fraudcheck.fraudchecks';
  public readonly methodTable = 'fraudcheck.method_repository';

  constructor(public connection: PostgresConnection) {}

  public async getScore(acquisitionId: number): Promise<number> {
    const query = {
      text: `
        WITH data AS (
          SELECT
            ff.karma,
            (fm.ponderation * ff.karma) AS result
          FROM ${this.methodTable} AS fm
          LEFT JOIN ${this.table} AS ff
            ON ff.method = fm._id 
            AND ff.acquisition_id = $1::int
          WHERE fm.active = true
        )
        SELECT
          avg(result) as score,
          CASE WHEN
            (count(*) FILTER (WHERE karma IS NULL) = 0)
            THEN true
            ELSE false
          END AS completed
        FROM data
      `,
      values: [acquisitionId],
    };

    const result = await this.connection.getClient().query(query);
    if (result.rowCount !== 1 || !result.rows[0].completed) {
      throw new UncompletedTestException('Some test are missing');
    }

    return result.rows[0].score;
  }
  public async createOrUpdateMany(completedFraudCheck: FraudCheck[]): Promise<void> {

  }
  /**
   * Find or insert a fraud check entry from acquisition_id and method name
   * It return the fraud check entry or undefined
   */
  public async findOrCreateFraudCheck<T = any>(acquisitionId: number, method: string): Promise<FraudCheck> {
    const query = {
      text: `
      WITH ins AS (
        INSERT INTO ${this.table} (
          acquisition_id,
          method,
          meta
        ) VALUES ($1::int, $2, '{}'::json)
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
      WHERE acquisition_id = $1::int
      AND method = $2)) AS foo`,
      values: [acquisitionId, method],
    };

    const result = await this.connection.getClient().query(query);

    if (result.rowCount !== 1) {
      return undefined;
    }

    return result.rows[0];
  }

}
