import { provider } from '@ilos/common';
import { promisify } from 'util';
import { PostgresConnection, Cursor } from '@ilos/connection-postgres';

import {
  IncentiveRepositoryProviderInterfaceResolver,
  IncentiveStatsInterface,
  IncentiveStateEnum,
  IncentiveStatusEnum,
  SerializedIncentiveInterface,
  SerializedMetadataVariableDefinitionInterface,
} from '../interfaces';

@provider({
  identifier: IncentiveRepositoryProviderInterfaceResolver,
})
export class IncentiveRepositoryProvider implements IncentiveRepositoryProviderInterfaceResolver {
  public readonly table = 'policy.incentives';
  public readonly tripTable = 'policy.trips';

  constructor(protected connection: PostgresConnection) {}

  async disableOnCanceledTrip(): Promise<void> {
    console.debug(`DISABLE_ON_CANCELED_TRIPS`);
    const query = {
      text: `
        UPDATE ${this.table} AS pi
        SET
          state = 'disabled'::policy.incentive_state_enum,
          status = 'error'::policy.incentive_status_enum
        FROM ${this.tripTable} AS pt
        WHERE
          pt.carpool_id = pi.carpool_id AND
          pt.carpool_status <> 'ok'::carpool.carpool_status_enum
      `,
      values: [],
    };

    await this.connection.getClient().query(query);
  }

  async lockAll(before: Date, failure = false): Promise<void> {
    const query = {
      text: `
        UPDATE ${this.table}
          SET status = $1::policy.incentive_status_enum
        WHERE
          datetime <= $2::timestamp AND
          status = $3::policy.incentive_status_enum
      `,
      values: [
        failure ? IncentiveStatusEnum.Draft : IncentiveStatusEnum.Valitated,
        before,
        IncentiveStatusEnum.Pending,
      ],
    };

    await this.connection.getClient().query(query);
  }

  async updateStatefulAmount(
    data: SerializedIncentiveInterface<number>[],
    status?: IncentiveStatusEnum,
  ): Promise<void> {
    const idSet: Set<string> = new Set();

    // get only last incentive for each carpool / policy
    const filteredData = data.reverse().filter((d) => {
      const key = `${d.policy_id}/${d.carpool_id}`;
      if (idSet.has(key)) {
        return false;
      }
      idSet.add(key);
      return true;
    });

    // pick values for the given keys. Override status if defined
    const values: [Array<number>, Array<number>, Array<IncentiveStatusEnum>] = filteredData.reduce(
      ([ids, amounts, statuses], i) => {
        ids.push(i._id);
        amounts.push(i.statefulAmount);
        statuses.push(status ?? i.status);
        return [ids, amounts, statuses];
      },
      [[], [], []],
    );

    const query = {
      text: `
      WITH data AS (
        SELECT * FROM UNNEST (
          $1::int[],
          $2::int[],
          $3::policy.incentive_status_enum[]
        ) as t(
          _id,
          amount,
          status
        )
      )
      UPDATE ${this.table} as pi
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
        data._id = pi._id
      `,
      values: [...values],
    };

    await this.connection.getClient().query(query);
  }

  async *findDraftIncentive(
    to: Date,
    batchSize = 100,
    from?: Date,
  ): AsyncGenerator<SerializedIncentiveInterface<number>[], void, void> {
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
      values: [IncentiveStatusEnum.Draft, to, ...(from ? [from] : [])],
    });

    console.debug(`FOUND ${resCount.rows[0].count} incentives to process`);

    const query = {
      text: `
      SELECT
        _id,
        carpool_id,
        policy_id,
        datetime,
        result as stateless_amount,
        amount as stateful_amount,
        status,
        state,
        meta
      FROM ${this.table}
      WHERE
        status = $1::policy.incentive_status_enum
        ${from ? 'AND datetime >= $3::timestamp' : ''}
        AND datetime <= $2::timestamp
      ORDER BY datetime ASC;
      `,
      values: [IncentiveStatusEnum.Draft, to, ...(from ? [from] : [])],
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
          yield rows.map((r) => {
            const { stateful_amount, stateless_amount, ...other } = r;
            return {
              ...other,
              statefulAmount: r.stateful_amount,
              statelessAmount: r.stateless_amount,
            };
          });
        }
      } catch (e) {
        cursor.close(() => client.release());
        throw e;
      }
    } while (count > 0);
    cursor.close(() => client.release());
  }

  async createOrUpdateMany(data: SerializedIncentiveInterface<undefined>[]): Promise<void> {
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
        status: i.status || IncentiveStatusEnum.Draft,
        state: i.statefulAmount === 0 ? IncentiveStateEnum.Null : IncentiveStateEnum.Regular,
        meta: i.meta || {},
      }));

    const values: [
      Array<number>,
      Array<number>,
      Array<Date>,
      Array<number>,
      Array<number>,
      Array<IncentiveStatusEnum>,
      Array<IncentiveStateEnum>,
      Array<SerializedMetadataVariableDefinitionInterface>,
    ] = filteredData.reduce(
      ([policyIds, carpoolIds, datetimes, statelessAmounts, statefulAmounts, statuses, states, metas], i) => {
        policyIds.push(i.policy_id), carpoolIds.push(i.carpool_id), datetimes.push(i.datetime);
        statelessAmounts.push(i.statelessAmount),
          statefulAmounts.push(i.statefulAmount),
          statuses.push(i.status),
          states.push(i.state),
          metas.push(JSON.stringify(i.meta));
        return [policyIds, carpoolIds, datetimes, statelessAmounts, statefulAmounts, statuses, states, metas];
      },
      [[], [], [], [], [], [], [], []],
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
      values,
    };

    await this.connection.getClient().query(query);
    return;
  }

  async getPolicyIncentiveStats(policy_id: number, territory_id?: number): Promise<IncentiveStatsInterface> {
    const query = {
      text: `
        SELECT
          coalesce(sum(amount)::int, 0) as amount,
          (count(*) FILTER (WHERE amount > 0))::int as trip_subsidized,
          (count(*) FILTER (WHERE amount = 0))::int as trip_excluded
        FROM ${this.table}
        WHERE policy_id = $1
          AND state = 'regular'
          ${!!territory_id ? 'AND territory_id = $2' : ''}
      `,
      values: [policy_id, ...(territory_id ? [territory_id] : [])],
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
