import { provider } from '@ilos/common';
import { PoolClient, PostgresConnection } from '@ilos/connection-postgres';
import {
  AcquisitionCreateInterface,
  AcquisitionCreateResultInterface,
  AcquisitionFindInterface,
  AcquisitionRepositoryProviderInterface,
  AcquisitionSearchInterface,
  AcquisitionStatusEnum,
  AcquisitionStatusInterface,
  AcquisitionStatusSearchInterface,
  AcquisitionStatusSearchInterfaceA,
  AcquisitionStatusSearchInterfaceB,
  AcquisitionStatusUpdateInterface,
} from '../interfaces/AcquisitionRepositoryProviderInterface';

@provider()
export class AcquisitionRepositoryProvider implements AcquisitionRepositoryProviderInterface {
  public readonly table = 'acquisition.acquisitions';

  constructor(protected connection: PostgresConnection) {}

  async createOrUpdateMany<P = any>(
    data: Array<AcquisitionCreateInterface<P>>,
  ): Promise<Array<AcquisitionCreateResultInterface>> {
    const values = data.reduce(
      (acc, d) => {
        const [
          payload,
          operator_id,
          operator_journey_id,
          application_id,
          api_version,
          request_id,
          status,
          error_stage,
          errors,
        ] = acc;
        payload.push(JSON.stringify(d.payload));
        operator_id.push(d.operator_id);
        operator_journey_id.push(d.operator_journey_id);
        application_id.push(d.application_id);
        api_version.push(d.api_version);
        request_id.push(d.request_id);
        status.push(d.status || AcquisitionStatusEnum.Pending);
        error_stage.push(d.error_stage || null);
        errors.push(JSON.stringify(d.errors || []));
        return [
          payload,
          operator_id,
          operator_journey_id,
          application_id,
          api_version,
          request_id,
          status,
          error_stage,
          errors,
        ];
      },
      [[], [], [], [], [], [], [], [], []],
    );
    const query = {
      text: `
        INSERT INTO ${this.table} (
          payload,
          operator_id,
          journey_id,
          application_id,
          api_version,
          request_id,
          status,
          error_stage,
          errors
        )
        SELECT * FROM UNNEST(
          $1::json[],
          $2::int[],
          $3::varchar[],
          $4::int[],
          $5::smallint[],
          $6::varchar[],
          $7::acquisition.acquisition_status_enum[],
          $8::varchar[],
          $9::jsonb[]
        )
        ON CONFLICT (operator_id, journey_id)
        DO UPDATE SET (
          payload,
          application_id,
          api_version,
          request_id,
          status,
          error_stage,
          errors
        ) = (
          excluded.payload,
          excluded.application_id,
          excluded.api_version,
          excluded.request_id,
          excluded.status,
          excluded.error_stage,
          acquisitions.errors || excluded.errors
        ) WHERE acquisitions.status = ANY(ARRAY[
          'pending'::acquisition.acquisition_status_enum,
          'error'::acquisition.acquisition_status_enum
        ])
        RETURNING journey_id AS operator_journey_id, created_at
      `,
      values,
    };

    const result = await this.connection.getClient().query(query);
    return result.rows;
  }

  async updateManyStatus(data: Array<AcquisitionStatusUpdateInterface>, poolClient?: PoolClient): Promise<void> {
    const pool = poolClient ?? (await this.connection.getClient().connect());
    const values = data.reduce(
      (acc, d) => {
        const [acquisition_id, status, error_stage, errors] = acc;
        acquisition_id.push(d.acquisition_id);
        status.push(d.status);
        error_stage.push(d.error_stage);
        errors.push(JSON.stringify(d.errors));
        return [acquisition_id, status, error_stage, errors];
      },
      [[], [], [], []],
    );
    const query = {
      text: `
      WITH data AS (
        SELECT * FROM UNNEST (
          $1::int[],
          $2::acquisition.acquisition_status_enum[],
          $3::varchar[],
          $4::jsonb[]
        ) as t(
          acquisition_id,
          status,
          error_stage,
          errors
        )
      )
      UPDATE ${this.table} as pt
      SET (
        try_count,
        status,
        error_stage,
        errors
      ) = (
        pt.try_count + 1,
        CASE WHEN data.status IS NULL THEN pt.status ELSE data.status END,
        CASE WHEN data.error_stage IS NULL THEN pt.error_stage ELSE data.error_stage END,
        pt.errors || data.errors::jsonb
      )
      FROM data
      WHERE
        data.acquisition_id = pt._id
      `,
      values,
    };
    try {
      await pool.query(query);
      return;
    } finally {
      if (!poolClient) {
        pool.release();
      }
    }
  }

  async getStatus(search: AcquisitionStatusSearchInterface): Promise<AcquisitionStatusInterface> {
    const whereClauses = (search as AcquisitionStatusSearchInterfaceB).acquisition_id
      ? {
          text: ['aa._id = $1'],
          values: [(search as AcquisitionStatusSearchInterfaceB).acquisition_id],
        }
      : {
          text: ['aa.operator_id = $1', 'aa.journey_id = $2'],
          values: [
            (search as AcquisitionStatusSearchInterfaceA).operator_id,
            (search as AcquisitionStatusSearchInterfaceA).operator_journey_id,
          ],
        };
    const query = {
      text: `
        SELECT 
          aa._id,
          aa.journey_id as operator_journey_id,
          aa.created_at,
          aa.updated_at,
          CASE
            WHEN aa.status = 'ok'
              THEN cc.status::varchar
            ELSE aa.status::varchar
          END AS status,
          aa.error_stage,
          aa.errors
        FROM ${this.table} AS aa
        LEFT JOIN carpool.carpools AS cc
          ON aa._id = cc.acquisition_id
        WHERE ${whereClauses.text.join(' AND ')}
      `,
      values: whereClauses.values,
    };
    const result = await this.connection.getClient().query(query);
    return result.rows[0];
  }

  async findThenUpdate<P = any>(
    search: AcquisitionSearchInterface,
    timeout = 10000,
  ): Promise<[Array<AcquisitionFindInterface<P>>, (data: Array<AcquisitionStatusUpdateInterface>) => Promise<void>]> {
    const whereClauses = ['from', 'to', 'status']
      .filter((k) => k in search)
      .map((k, i) => {
        switch (k) {
          case 'from':
            return {
              text: `created_at >= $${i + 1}::timestamp`,
              values: [search[k]],
            };
          case 'to':
            return {
              text: `created_at < $${i + 1}::timestamp`,
              values: [search[k]],
            };
          case 'status':
            return {
              text: `status = $${i + 1}::acquisition.acquisition_status_enum`,
              values: [search[k]],
            };
        }
      })
      .reduce(
        (acc, v) => {
          const { text, values } = acc;
          text.push(v.text);
          values.push(...v.values);
          return { text, values };
        },
        { text: [], values: [] },
      );

    const query = {
      text: `
        SELECT 
          _id,
          operator_id,
          api_version,
          created_at,
          payload
        FROM ${this.table}
        WHERE ${whereClauses.text.join(' AND ')}
        ORDER BY _id
        LIMIT $${whereClauses.values.length + 1}
        FOR UPDATE SKIP LOCKED
      `,
      values: [...whereClauses.values, search.limit],
    };
    const pool = await this.connection.getClient().connect();
    try {
      await pool.query('BEGIN');
      const result = await pool.query(query);
      let hasTimeout = false;
      const timeoutFn = setTimeout(() => {
        hasTimeout = true;
        // this.updateManyStatus(result.rows.map(r =>))
        pool.query('ROLLBACK').finally(() => pool.release());
      }, timeout);
      return [
        result.rows,
        async (data: Array<AcquisitionStatusUpdateInterface>) => {
          if (timeoutFn && !hasTimeout) {
            clearTimeout(timeoutFn);
            try {
              await this.updateManyStatus(data, pool);
              await pool.query('COMMIT');
            } catch (e) {
              await pool.query('ROLLBACK');
              throw e;
            } finally {
              pool.release();
            }
          }
        },
      ];
    } catch (e) {
      await pool.query('ROLLBACK');
      pool.release();
      throw e;
    }
  }
}
