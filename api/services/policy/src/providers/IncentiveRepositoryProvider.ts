import { provider } from '@ilos/common';
import { promisify } from 'util';
import { PostgresConnection, Cursor } from '@ilos/connection-postgres';

import {
  IncentiveInterface,
  IncentiveRepositoryProviderInterface,
  IncentiveRepositoryProviderInterfaceResolver,
  IncentiveStateEnum,
  IncentiveStatusEnum,
  CampaignStateInterface,
} from '../interfaces';

@provider({
  identifier: IncentiveRepositoryProviderInterfaceResolver,
})
export class IncentiveRepositoryProvider implements IncentiveRepositoryProviderInterface {
  public readonly table = 'policy.incentives';
  public readonly tripTable = 'policy.trips';

  constructor(protected connection: PostgresConnection) {}

  async disableOnCanceledTrip(): Promise<void> {
    console.debug(`DISABLE_ON_CANCELED_TRIPS`);
    const query = {
      text: `
        UPDATE ${this.table} AS pi
        SET
          state = $1::policy.incentive_state_enum
        FROM ${this.tripTable} AS pt
        WHERE
          pt.carpool_id = pi.carpool_id AND
          pt.carpool_status = $2::carpool.carpool_status_enum
      `,
      values: ['disabled', 'canceled'],
    };

    await this.connection.getClient().query(query);
  }

  async lockAll(before: Date): Promise<void> {
    const query = {
      text: `
        UPDATE ${this.table}
          SET status = $1::policy.incentive_status_enum
        WHERE
          datetime <= $2::timestamp AND
          status = $3::policy.incentive_status_enum
      `,
      values: ['validated', before, 'draft'],
    };

    await this.connection.getClient().query(query);
  }

  async updateManyAmount(
    data: { carpool_id: number; policy_id: number; amount: number; status: IncentiveStatusEnum }[],
    status?: IncentiveStatusEnum,
  ): Promise<void> {
    const idSet: Set<string> = new Set();
    const filteredData = data.reverse().filter((d) => {
      const key = `${d.policy_id}/${d.carpool_id}`;
      if (idSet.has(key)) {
        return false;
      }
      idSet.add(key);
      return true;
    });

    // pick values for the given keys. Override status if defined
    const values = ['policy_id', 'carpool_id', 'amount', 'status'].map((k) =>
      filteredData.map((d) => (status && k === 'status' ? status : d[k])),
    );

    const query = {
      text: `
      WITH data AS (
        SELECT * FROM UNNEST (
          $1::int[],
          $2::int[],
          $3::int[],
          $4::policy.incentive_status_enum[]
        ) as t(
          policy_id,
          carpool_id,
          amount,
          status
        )
      )
      UPDATE ${this.table} as pt
      SET (
        amount,
        state,
        status
      ) = (
        data.amount,
        CASE WHEN data.amount = 0 THEN 'null'::policy.incentive_state_enum ELSE state END,
        data.status
      )
      FROM data
      WHERE
        data.carpool_id = pt.carpool_id
        AND data.policy_id = pt.policy_id
      `,
      values: [...values],
    };

    await this.connection.getClient().query(query);
  }

  async *findDraftIncentive(to: Date, batchSize = 100, from?: Date): AsyncGenerator<IncentiveInterface[], void, void> {
    const resCount = await this.connection.getClient().query({
      text: `
      SELECT
        count(*)
      FROM ${this.table}
      WHERE
        status = $1::policy.incentive_status_enum
        ${from ? 'AND datetime >= $3::timestamp' : ''}
        AND datetime <= $2::timestamp
      `,
      values: ['draft', to, ...(from ? [from] : [])],
    });

    console.debug(`FOUND ${resCount.rows[0].count} incentives to process`);

    const query = {
      text: `
      SELECT
        carpool_id,
        policy_id,
        datetime,
        result,
        amount,
        state,
        status,
        meta
      FROM ${this.table}
      WHERE
        status = $1::policy.incentive_status_enum
        ${from ? 'AND datetime >= $3::timestamp' : ''}
        AND datetime <= $2::timestamp
      ORDER BY datetime ASC;
      `,
      values: ['draft', to, ...(from ? [from] : [])],
    };

    const client = await this.connection.getClient().connect();
    const cursor = client.query(new Cursor(query.text, query.values));
    const promisifiedCursorRead = promisify(cursor.read.bind(cursor));

    let count = 0;
    do {
      try {
        const rows = await promisifiedCursorRead(batchSize);
        count = rows.length;
        if (count > 0) {
          yield rows;
        }
      } catch (e) {
        cursor.close(() => client.release());
        throw e;
      }
    } while (count > 0);
    cursor.close(() => client.release());
  }

  async createOrUpdateMany(data: IncentiveInterface[]): Promise<void> {
    const idSet: Set<string> = new Set();
    const filteredData = data
      .reverse()
      .filter((d) => {
        const key = `${d.policy_id}/${d.carpool_id}`;
        if (idSet.has(key)) {
          return false;
        }
        idSet.add(key);
        return true;
      })
      .map((i) => ({
        ...i,
        status: i.status || 'validated',
        state: i.amount === 0 ? IncentiveStateEnum.Null : IncentiveStateEnum.Regular,
        meta: i.meta || {},
      }));

    const keys = ['policy_id', 'carpool_id', 'datetime', 'result', 'amount', 'status', 'state', 'meta'].map((k) =>
      filteredData.map((d) => d[k]),
    );

    const query = {
      text: `
        INSERT INTO ${this.table} (
          policy_id,
          carpool_id,
          datetime,
          result,
          amount,
          status,
          state,
          meta
        ) SELECT * FROM UNNEST(
          $1::int[],
          $2::int[],
          $3::timestamp[],
          $4::int[],
          $5::int[],
          $6::policy.incentive_status_enum[],
          $7::policy.incentive_state_enum[],
          $8::json[]
        )
        ON CONFLICT (policy_id, carpool_id)
        DO UPDATE SET (
          result,
          amount,
          status,
          state,
          meta
        ) = (
          excluded.result,
          excluded.amount,
          excluded.status,
          excluded.state,
          excluded.meta
        )
      `,
      values: [...keys],
    };

    await this.connection.getClient().query(query);
    return;
  }

  async getCampaignState(policy_id: number): Promise<CampaignStateInterface> {
    const query = {
      text: `
        SELECT
          coalesce(sum(amount)::int, 0) as amount,
          (count(*) FILTER (WHERE amount > 0))::int as trip_subsidized,
          (count(*) FILTER (WHERE amount = 0))::int as trip_excluded
        FROM ${this.table}
        WHERE policy_id = $1
          AND state = 'regular'
      `,
      values: [policy_id],
    };

    const result = await this.connection.getClient().query(query);

    return result.rowCount
      ? result.rows[0]
      : {
          amount: 0,
          trip_excluded: 0,
          trip_subsidized: 0,
        };
  }
}
