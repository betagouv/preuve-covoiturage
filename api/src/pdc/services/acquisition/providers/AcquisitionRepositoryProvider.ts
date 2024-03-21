import { NotFoundException, provider } from '@ilos/common';
import { PoolClient, PostgresConnection } from '@ilos/connection-postgres';
import { castStatus, fromStatus } from '../helpers/castStatus';
import {
  AcquisitionCreateInterface,
  AcquisitionCreateResultInterface,
  AcquisitionFindInterface,
  AcquisitionRepositoryProviderInterface,
  AcquisitionSearchInterface,
  AcquisitionStatusEnum,
  AcquisitionStatusInterface,
  AcquisitionStatusUpdateInterface,
  StatusSearchInterface,
} from '../interfaces/AcquisitionRepositoryProviderInterface';

@provider()
export class AcquisitionRepositoryProvider implements AcquisitionRepositoryProviderInterface {
  public readonly table = 'acquisition.acquisitions';
  public readonly carpoolTable = 'carpool.carpools';

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
        ) WHERE
          acquisitions.status = 'pending'::acquisition.acquisition_status_enum OR
          (
            acquisitions.status = 'error'::acquisition.acquisition_status_enum AND
            acquisitions.error_stage = ANY(ARRAY['acquisition','normalization'])
          )
        RETURNING journey_id AS operator_journey_id, created_at
      `,
      values,
    };

    const result = await this.connection.getClient().query(query);
    return result.rows;
  }

  async cancel(operator_id: number, operator_journey_id: string, code?: string, message?: string): Promise<void> {
    await this.connection.getClient().query({
      text: `
        UPDATE ${this.table}
          SET
            status = 'canceled',
            cancel_code = $3,
            cancel_message = $4
          WHERE
            operator_id = $1 AND
            journey_id = $2 
      `,
      values: [operator_id, operator_journey_id, code, message],
    });
  }

  async getStatus(operator_id: number, operator_journey_id: string): Promise<AcquisitionStatusInterface | undefined> {
    const whereClauses = {
      text: ['aa.operator_id = $1', 'aa.journey_id = $2'],
      values: [operator_id, operator_journey_id],
    };
    const query = {
      text: `
        SELECT 
          aa._id,
          aa.created_at,
          aa.updated_at,
          cc.status as carpool_status,
          aa.status as acquisition_status,
          aa.error_stage as acquisition_error_stage,
          fl.label as fraud_label,
          al.label as anomaly_label,
          al.conflicting_operator_journey_id,
          al.overlap_duration_ratio
        FROM ${this.table} AS aa
        LEFT JOIN carpool.carpools AS cc ON aa._id = cc.acquisition_id
        LEFT JOIN fraudcheck.labels as fl ON cc._id = fl.carpool_id
        LEFT JOIN anomaly.labels as al on cc._id = al.carpool_id
        WHERE ${whereClauses.text.join(' AND ')}
      `,
      values: whereClauses.values,
    };
    const result = await this.connection.getClient().query(query);
    if (!result.rows.length) {
      return;
    }
    const { _id, created_at, updated_at, carpool_status, acquisition_status, acquisition_error_stage } = result.rows[0];
    return {
      _id,
      operator_journey_id,
      created_at,
      updated_at,
      status: castStatus(carpool_status, acquisition_status, acquisition_error_stage),
      fraud_error_labels: result.rows.map((r) => r.fraud_label).filter((l) => !!l),
      anomaly_error_details: result.rows
        .filter((l) => !!l.anomaly_label)
        .map((a) => ({
          label: a.anomaly_label,
          metas: {
            conflicting_journey_id: a.conflicting_operator_journey_id,
            temporal_overlap_duration_ratio: a.overlap_duration_ratio,
          },
        })),
    };
  }

  async findThenUpdate<P = any>(
    search: AcquisitionSearchInterface,
  ): Promise<
    [
      Array<AcquisitionFindInterface<P>>,
      (data?: AcquisitionStatusUpdateInterface) => Promise<void>,
      () => Promise<void>,
    ]
  > {
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

    const pool = this.connection.getClient();
    const poolClient = await pool.connect();

    try {
      await poolClient.query('BEGIN');
      const result = await poolClient.query(query);

      return [
        result.rows,

        // update data
        async (data: AcquisitionStatusUpdateInterface) => {
          data && (await this.updateManyStatus([data], poolClient));
        },

        // commit and release
        async () => {
          console.info('  >>> COMMIT');
          await poolClient.query('COMMIT');
          poolClient.release();
        },
      ];
    } catch (e) {
      await poolClient.query('ROLLBACK');
      poolClient.release();

      throw e;
    }
  }

  async updateManyStatus(data: Array<AcquisitionStatusUpdateInterface>, poolClient?: PoolClient): Promise<void> {
    const pool = poolClient ?? (await this.connection.getClient().connect());
    await pool.query(poolClient ? 'SAVEPOINT results' : 'BEGIN');
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
      await pool.query(poolClient ? 'RELEASE SAVEPOINT results' : 'COMMIT');
      return;
    } catch (e) {
      await pool.query(poolClient ? 'ROLLBACK TO SAVEPOINT results' : 'ROLLBACK');
      if (!poolClient) {
        throw e;
      }
    } finally {
      if (!poolClient) {
        pool.release();
      }
    }
  }

  async list(search: StatusSearchInterface): Promise<Array<{ operator_journey_id: string }>> {
    const { start, end, limit, offset, operator_id, status } = search;
    const { carpool_status, acquisition_status, acquisition_error } = fromStatus(status);
    if (!carpool_status) {
      const result = await this.connection.getClient().query({
        text: `
          SELECT journey_id as operator_journey_id
          FROM ${this.table}
          WHERE
            created_at >= $1 AND
            created_at < $2 AND
            operator_id = $3 AND
            status = $4 ${acquisition_error ? 'AND error_stage = $7' : ''}
          ORDER BY created_at DESC
          LIMIT $5
          OFFSET $6
        `,
        values: [
          start,
          end,
          operator_id,
          acquisition_status,
          limit,
          offset,
          ...(acquisition_error ? [acquisition_error] : []),
        ],
      });
      return result.rows;
    }
    const result = await this.connection.getClient().query({
      text: `
        SELECT operator_journey_id
        FROM ${this.carpoolTable}
        WHERE 
            created_at >= $1 AND
            created_at < $2 AND
            operator_id = $3 AND
            status = $4 AND
            is_driver = true
        ORDER BY created_at DESC
        LIMIT $5
        OFFSET $6
      `,
      values: [start, end, operator_id, carpool_status, limit, offset],
    });
    return result.rows;
  }

  async patchPayload<P = any>(
    search: { operator_id: number; operator_journey_id: string; status: Array<AcquisitionStatusEnum> },
    payload: P,
  ): Promise<void> {
    const connection = await this.connection.getClient().connect();
    await connection.query('BEGIN');
    try {
      const oldPayloadResult = await connection.query({
        text: `
          SELECT payload FROM ${this.table}
          WHERE operator_id = $1 AND journey_id = $2 AND status = ANY($3)
          FOR UPDATE SKIP LOCKED
        `,
        values: [search.operator_id, search.operator_journey_id, search.status],
      });

      if (!oldPayloadResult.rowCount) {
        throw new NotFoundException();
      }

      const newPayload = { ...oldPayloadResult.rows[0].payload, ...payload };
      await connection.query({
        text: `
          UPDATE ${this.table} SET payload = $4
          WHERE operator_id = $1 AND journey_id = $2 AND status = ANY($3)
        `,
        values: [search.operator_id, search.operator_journey_id, search.status, JSON.stringify(newPayload)],
      });
      await connection.query('COMMIT');
    } catch (e) {
      await connection.query('ROLLBACK');
      throw e;
    } finally {
      connection.release();
    }
  }
}
