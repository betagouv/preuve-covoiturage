import { provider } from "@/ilos/common/index.ts";
import { PostgresConnection } from "@/ilos/connection-postgres/index.ts";

import {
  IncentiveRepositoryProviderInterfaceResolver,
  IncentiveStateEnum,
  IncentiveStatusEnum,
  SerializedIncentiveInterface,
  SerializedMetadataVariableDefinitionInterface,
} from "../interfaces/index.ts";

@provider({
  identifier: IncentiveRepositoryProviderInterfaceResolver,
})
export class IncentiveRepositoryProvider
  implements IncentiveRepositoryProviderInterfaceResolver {
  public readonly incentivesTable = "policy.incentives";
  public readonly carpoolTable = "carpool_v2.carpools";
  public readonly carpoolStatusTable = "carpool_v2.status";

  /**
   * @deprecated [carpool_v2_migration]
   */
  public readonly oldCarpoolTable = "carpool.carpools";

  constructor(protected connection: PostgresConnection) {}

  async disableOnCanceledTrip(from: Date, to: Date): Promise<void> {
    const oldQuery = {
      text: `
        UPDATE ${this.incentivesTable} AS pi
        SET
          state = 'disabled'::policy.incentive_state_enum,
          status = 'error'::policy.incentive_status_enum
        FROM ${this.oldCarpoolTable} AS oc
        WHERE oc.datetime >= $1::timestamp
          AND oc.datetime <  $2::timestamp
          AND oc._id = pi.carpool_id
          AND oc.status <> 'ok'::carpool.carpool_status_enum
      `,
      values: [from, to],
    };

    const query = {
      text: `
        UPDATE ${this.incentivesTable} AS pi
        SET
          state = 'disabled'::policy.incentive_state_enum,
          status = 'error'::policy.incentive_status_enum
        FROM ${this.carpoolTable} AS cc
        JOIN ${this.carpoolStatusTable} AS cs
          ON cs.carpool_id = cc._id
        WHERE cc.start_datetime >= $1::timestamp
          AND cc.start_datetime <  $2::timestamp
          AND cc.operator_id = pi.operator_id
          AND cc.operator_journey_id = pi.operator_journey_id
          AND cs.acquisition_status = 'canceled'
      `,
      values: [from, to],
    };

    await this.connection.getClient().query<any>(oldQuery);
    await this.connection.getClient().query<any>(query);
  }

  /**
   * Set the status of pending incentives to either Draft or Validated
   */
  async setStatus(from: Date, to: Date, hasFailed = false): Promise<void> {
    const query = {
      text: `
        UPDATE ${this.incentivesTable}
          SET status = $1::policy.incentive_status_enum
        WHERE datetime >= $2::timestamp
          AND datetime <  $3::timestamp
          AND status = $4::policy.incentive_status_enum
      `,
      values: [
        hasFailed ? IncentiveStatusEnum.Draft : IncentiveStatusEnum.Validated,
        from,
        to,
        IncentiveStatusEnum.Pending,
      ],
    };

    await this.connection.getClient().query<any>(query);
  }

  async updateStatefulAmount(
    data: SerializedIncentiveInterface<number>[],
    status?: IncentiveStatusEnum,
  ): Promise<void> {
    const idSet: Set<string> = new Set();

    // get only last incentive for each carpool / policy
    const filteredData = data.reverse().filter((d) => {
      const key = `${d.policy_id}/${d.operator_id}/${d.operator_journey_id}`;
      if (idSet.has(key)) {
        return false;
      }
      idSet.add(key);
      return true;
    });

    // pick values for the given keys. Override status if defined
    const values: [Array<number>, Array<number>, Array<IncentiveStatusEnum>] =
      filteredData.reduce(
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
      UPDATE ${this.incentivesTable} as pi
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

    await this.connection.getClient().query<any>(query);
  }

  async *findDraftIncentive(
    to: Date,
    batchSize = 100,
    from?: Date,
  ): AsyncGenerator<SerializedIncentiveInterface<number>[], void, void> {
    const resCount = await this.connection.getClient().query<any>({
      text: `
      SELECT
        count(*)
      FROM ${this.incentivesTable}
      WHERE
        status = $1::policy.incentive_status_enum
        ${from ? "AND datetime >= $3::timestamp" : ""}
        AND datetime < $2::timestamp
      `,
      values: [IncentiveStatusEnum.Draft, to, ...(from ? [from] : [])],
    });

    console.debug(`FOUND ${resCount.rows[0].count} incentives to process`);

    const query = {
      text: `
      SELECT
        _id,
        policy_id,
        datetime,
        result as stateless_amount,
        amount as stateful_amount,
        status,
        state,
        operator_id,
        operator_journey_id,
        meta
      FROM ${this.incentivesTable}
      WHERE
        status = $1::policy.incentive_status_enum
        ${from ? "AND datetime >= $3::timestamp" : ""}
        AND datetime <= $2::timestamp
      ORDER BY datetime ASC;
      `,
      values: [IncentiveStatusEnum.Draft, to, ...(from ? [from] : [])],
    };

    const cursor = await this.connection.getCursor(query.text, query.values);

    let count = 0;
    do {
      try {
        const rows = await cursor.read(batchSize);
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
        await cursor.release();
        throw e;
      }
    } while (count > 0);

    await cursor.release();
  }

  async createOrUpdateMany(
    data: SerializedIncentiveInterface<undefined>[],
  ): Promise<void> {
    const idSet: Set<string> = new Set();
    const filteredData = data
      .reverse()
      .filter((d) => {
        const key = `${d.policy_id}/${d.operator_id}/${d.operator_journey_id}`;
        if (idSet.has(key)) {
          return false;
        }
        idSet.add(key);
        return true;
      })
      .map((i) => ({
        ...i,
        status: i.status || IncentiveStatusEnum.Draft,
        state: i.statefulAmount === 0
          ? IncentiveStateEnum.Null
          : IncentiveStateEnum.Regular,
        meta: i.meta || {},
      }));

    const values: [
      Array<number>,
      Array<Date>,
      Array<number>,
      Array<number>,
      Array<IncentiveStatusEnum>,
      Array<IncentiveStateEnum>,
      Array<number>,
      Array<number>,
      Array<SerializedMetadataVariableDefinitionInterface>,
    ] = filteredData.reduce(
      (
        [
          policyIds,
          datetimes,
          statelessAmounts,
          statefulAmounts,
          statuses,
          states,
          operatorIds,
          operatorJourneyIds,
          metas,
        ],
        i,
      ) => {
        policyIds.push(i.policy_id);
        datetimes.push(i.datetime);
        statelessAmounts.push(i.statelessAmount);
        statefulAmounts.push(i.statefulAmount);
        statuses.push(i.status);
        states.push(i.state);
        operatorIds.push(i.operator_id);
        operatorJourneyIds.push(i.operator_journey_id);
        metas.push(JSON.stringify(i.meta));
        return [
          policyIds,
          datetimes,
          statelessAmounts,
          statefulAmounts,
          statuses,
          states,
          operatorIds,
          operatorJourneyIds,
          metas,
        ];
      },
      [[], [], [], [], [], [], [], [], []],
    );

    const query = {
      text: `
        -- FIXME: temp hack to set a lower boundary when
        --        joining the deprecated carpool.carpools table
        WITH lowest_incentive AS (
          SELECT min(dtz) AS datetime
          FROM UNNEST($2::timestamp with time zone[]) AS x(dtz)
        )
        --

        INSERT INTO ${this.incentivesTable} (
          policy_id,
          carpool_id,
          datetime,
          result,
          amount,
          status,
          state,
          operator_id,
          operator_journey_id,
          meta
        )
        SELECT
          unnest_data.policy_id,
          cc._id as carpool_id,
          unnest_data.datetime,
          unnest_data.result,
          unnest_data.amount,
          unnest_data.status,
          unnest_data.state,
          unnest_data.operator_id,
          unnest_data.operator_journey_id,
          unnest_data.meta
        FROM UNNEST(
          $1::int[],
          $2::timestamp[],
          $3::int[],
          $4::int[],
          $5::policy.incentive_status_enum[],
          $6::policy.incentive_state_enum[],
          $7::int[],
          $8::varchar[],
          $9::json[]
        ) AS unnest_data(policy_id, datetime, result, amount, status, state, operator_id, operator_journey_id, meta)

        -- FIXME : REMOVE WHEN DONE WITH carpool.carpools
        JOIN ${this.oldCarpoolTable} cc
          ON cc.operator_id = unnest_data.operator_id
          AND cc.operator_journey_id = unnest_data.operator_journey_id
          AND cc.datetime >= (SELECT datetime FROM lowest_incentive)
          AND cc.is_driver IS TRUE
        --

        ON CONFLICT (policy_id, operator_id, operator_journey_id)
        DO UPDATE SET
          result = excluded.result,
          amount = excluded.amount,
          status = excluded.status,
          state = excluded.state,
          meta = excluded.meta;
      `,
      values,
    };

    await this.connection.getClient().query<any>(query);
    return;
  }

  async latestDraft(): Promise<Date> {
    const query = {
      text: `
        SELECT min(datetime) AS datetime
        FROM ${this.incentivesTable}
        WHERE status = $1::policy.incentive_status_enum
          AND datetime > current_timestamp - interval '1 year'
        `,
      values: [IncentiveStatusEnum.Draft],
    };

    const res = await this.connection.getClient().query<any>(query);
    return res.rows[0]?.datetime;
  }

  // TODO dedup from PolicyRepositoryProvider.syncIncentiveSum
  async updateIncentiveSum(): Promise<void> {
    await this.connection.getClient().query<any>(`
      UPDATE policy.policies p
      SET incentive_sum = policy_incentive_sum.amount
      FROM
        (SELECT policy_id, coalesce(sum(amount),0)::int AS amount
          FROM policy.incentives
          WHERE status = 'validated'
          GROUP BY policy_id) AS policy_incentive_sum
      WHERE p._id = policy_incentive_sum.policy_id
    `);
  }
}
