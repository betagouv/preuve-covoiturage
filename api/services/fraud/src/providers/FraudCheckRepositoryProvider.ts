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
            AND ff.status = 'done'::fraudcheck.status_enum
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

  public async createOrUpdateMany(data: FraudCheck[]): Promise<void> {
    const normalizedData = data.map(d => {
      const { error, ...other } = d;
      return {
        ...other,
        meta: {
          error,
        },
      };
    });

    const keys = ['acquisition_id', 'method', 'status', 'karma', 'meta'].map((k) => normalizedData.map((d) => d[k]));

    const query = {
      text: `
        INSERT INTO ${this.table} (
          acquisition_id,
          method,
          status,
          karma,
          meta
        ) SELECT * FROM UNNEST(
          $1::int[],
          $2::varchar[],
          $3::fraudcheck.status_enum[],
          $4::int[],
          $5::json[]
        )
        ON CONFLICT (acquisition_id, method)
        DO UPDATE SET (
          status,
          karma,
          meta
        ) = (
          excluded.status,
          excluded.karma,
          excluded.meta
        )
      `,
      values: [...keys],
    };

    await this.connection.getClient().query(query);
    return;
  }
}
