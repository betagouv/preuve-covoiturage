import { provider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';

import {
  FraudCheckRepositoryProviderInterface,
  FraudCheckRepositoryProviderInterfaceResolver,
  FraudCheck,
  FraudCheckComplete,
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

  /**
   * Find or insert a fraud check entry from acquisition_id and method name
   * It return the fraud check entry or undefined
   */
  public async findOrCreateFraudCheck<T = any>(acquisitionId: number, method: string): Promise<FraudCheck<T>> {
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

  /**
   *  Update a fraud check entry
   */
  public async updateFraudCheck(fraud: FraudCheck): Promise<void> {
    // TODO updateOrCreate()
    const query = {
      text: `
      UPDATE ${this.table} SET
        status = $2,
        karma = $3,
        meta = $4::json
      WHERE
        _id = $1
      `,
      values: [fraud._id, fraud.status, fraud.karma, JSON.stringify(fraud.meta)],
    };

    const result = await this.connection.getClient().query(query);

    if (result.rowCount !== 1) {
      throw new Error('fraudentry is not existing');
    }

    return;
  }

  /**
   *  Return all fraud check entry for an acquistion
   *  By default, filtering by status with 'done'
   *  and return only the method
   */
  public async getAllCheckByAcquisition(
    acquisitionId: number,
    status: string[] = ['done'],
    onlyMethod = true,
  ): Promise<(FraudCheckComplete | { method: string })[]> {
    const fields = onlyMethod
      ? 'method'
      : `
      _id,
      method,
      acquisition_id::integer,
      status,
      meta,
      karma`;

    const query = {
      text: `
      SELECT
        ${fields}
      FROM ${this.table}
      WHERE
        acquisition_id = $1::int
        AND status::varchar = ANY($2::varchar[])
      `,
      values: [acquisitionId, status],
    };

    const result = await this.connection.getClient().query(query);
    return result.rows;
  }

  /**
   *  Return all fraud check entry for a method name
   *  By default, filtering by status with 'done'
   *  and return only the acquition id
   */
  public async getAllCheckByMethod(
    method: string,
    status: string[] = ['done'],
    onlyAcquisition = true,
  ): Promise<(FraudCheckComplete | { acquisition_id: number })[]> {
    const fields = onlyAcquisition
      ? 'acquisition_id::integer'
      : `
      _id,
      method,
      acquisition_id::integer,
      status,
      meta,
      karma`;

    const query = {
      text: `
      SELECT
        ${fields}
      FROM ${this.table}
      WHERE
        method = $1
        AND status::varchar = ANY($2::varchar[])
      `,
      values: [method, status],
    };

    const result = await this.connection.getClient().query(query);
    return result.rows;
  }
}
