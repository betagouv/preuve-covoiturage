import { provider } from "@/ilos/common/index.ts";
import { PostgresConnection } from "@/ilos/connection-postgres/index.ts";
import sql from "@/lib/pg/sql.ts";
import {
  CarpoolInterface,
  CarpoolTypeEnum,
  DBCarpoolInterface,
} from "@/pdc/services/certificate/contracts/common/interfaces/CarpoolInterface.ts";
import { identitySelectorHelper } from "@/pdc/services/certificate/helpers/identitySelectorHelper.ts";
import { wherePositionsHelper } from "@/pdc/services/certificate/helpers/wherePositionsHelper.ts";
import {
  CarpoolRepositoryProviderInterface,
  CarpoolRepositoryProviderInterfaceResolver,
  FindParamsInterface,
} from "../interfaces/CarpoolRepositoryProviderInterface.ts";

@provider({
  identifier: CarpoolRepositoryProviderInterfaceResolver,
})
export class CarpoolPgRepositoryProvider implements CarpoolRepositoryProviderInterface {
  constructor(protected connection: PostgresConnection) {}

  /**
   * Find all carpools for an identity on a given period of time
   * Results can be restricted around start and end geo positions
   */
  async find(params: FindParamsInterface): Promise<CarpoolInterface[]> {
    const {
      identities,
      operator_id,
      tz,
      start_at,
      end_at,
      positions = [],
      radius = 1000,
    } = params;

    // deno-fmt-ignore
    const query = sql`
      WITH trips AS (
        SELECT
          'driver' as type,
          SUBSTR((cc.start_datetime AT TIME ZONE ${tz})::text, 0, 11) AS date,
          cc.start_datetime AT TIME ZONE ${tz} AS datetime,
          cc.distance,
          cc.driver_revenue AS payment
        FROM carpool_v2.carpools AS cc
        JOIN carpool_v2.status AS cs ON cc._id = cs.carpool_id
        WHERE
          cc.operator_id = ${operator_id}
          AND cs.acquisition_status = 'processed'
          AND cs.fraud_status = 'passed'
          -- AND cs.anomaly_status = 'passed'
          AND cc.start_datetime >= ${start_at}
          AND cc.start_datetime <  ${end_at}
          ${identitySelectorHelper(CarpoolTypeEnum.DRIVER, identities)}
          ${wherePositionsHelper(positions, radius)}

        UNION ALL

        SELECT
          'passenger' as type,
          SUBSTR((cc.start_datetime AT TIME ZONE ${tz})::text, 0, 11) AS date,
          cc.start_datetime AT TIME ZONE ${tz} AS datetime,
          cc.distance,
          passenger_contribution AS payment
        FROM carpool_v2.carpools AS cc
        JOIN carpool_v2.status AS cs ON cc._id = cs.carpool_id
        WHERE
          cc.operator_id = ${operator_id}
          AND cs.acquisition_status = 'processed'
          AND cs.fraud_status = 'passed'
          -- AND cs.anomaly_status = 'passed'
          AND cc.start_datetime >= ${start_at}
          AND cc.start_datetime <  ${end_at}
          ${identitySelectorHelper(CarpoolTypeEnum.PASSENGER, identities)}
          ${wherePositionsHelper(positions, radius)}
      )
      SELECT
          type,
          date,
          COUNT(*)::int trips,
          TRUNC(SUM(distance)::decimal, 3)::real AS distance,
          TRUNC(SUM(payment)::decimal/100, 2)::real AS amount
      FROM trips
      GROUP BY (type, date)
      ORDER BY type, date DESC
    `;

    const result = await this.connection.getClient().query<DBCarpoolInterface>(
      query,
    );

    return result.rows.map(
      (row: DBCarpoolInterface): CarpoolInterface => ({
        type: row.type,
        datetime: new Date(row.date),
        trips: row.trips,
        distance: row.distance,
        amount: row.amount,
      }),
    );
  }
}
