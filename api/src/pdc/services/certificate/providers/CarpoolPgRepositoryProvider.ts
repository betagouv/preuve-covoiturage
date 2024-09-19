import { provider } from "@/ilos/common/index.ts";
import { PostgresConnection } from "@/ilos/connection-postgres/index.ts";
import { identitySelectorHelper } from "@/pdc/services/certificate/helpers/identitySelectorHelper.ts";
import {
  CarpoolInterface,
  CarpoolTypeEnum,
  DBCarpoolInterface,
} from "@/shared/certificate/common/interfaces/CarpoolInterface.ts";
import { PointInterface } from "@/shared/common/interfaces/PointInterface.ts";
import {
  CarpoolRepositoryProviderInterface,
  CarpoolRepositoryProviderInterfaceResolver,
  FindParamsInterface,
} from "../interfaces/CarpoolRepositoryProviderInterface.ts";

@provider({
  identifier: CarpoolRepositoryProviderInterfaceResolver,
})
export class CarpoolPgRepositoryProvider
  implements CarpoolRepositoryProviderInterface {
  constructor(protected connection: PostgresConnection) {}

  /**
   * Find all carpools for an identity on a given period of time
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

    const values: any[] = [operator_id, start_at, end_at];

    const where_positions = positions
      .reduce((prev: string[], pos: PointInterface): string[] => {
        prev.push(
          `ST_Distance(ST_MakePoint(\$${values.length + 1}, \$${
            values.length + 2
          }), cc.start_position) < \$${values.length + 3}`,
        );
        values.push(pos.lon, pos.lat, Math.abs(radius | 0));

        prev.push(
          `ST_Distance(ST_MakePoint(\$${values.length + 1}, \$${
            values.length + 2
          }), cc.end_position) < \$${values.length + 3}`,
        );
        values.push(pos.lon, pos.lat, Math.abs(radius | 0));

        return prev;
      }, [])
      .join(" OR ");

    // add Timezone at last position of the values array
    values.push(tz || "GMT");

    // list trips as driver and passenger for a given identity
    // get the greatest payment amount from the trip, the meta payments
    const text = `
      WITH trips AS (
        SELECT
          'driver' as type,
          SUBSTR((cc.start_datetime AT TIME ZONE $${values.length})::text, 0, 11) AS date,
          cc.start_datetime AT TIME ZONE $${values.length} AS datetime,
          cc.distance,
          cc.driver_revenue AS payment
        FROM carpool_v2.carpools AS cc
        JOIN carpool_v2.status AS cs ON cc._id = cs.carpool_id
        WHERE
          cc.operator_id = $1::int
          AND cs.acquisition_status = 'processed'
          AND cs.fraud_status = 'passed'
          -- AND cs.anomaly_status = 'passed'
          AND cc.start_datetime >= $2
          AND cc.start_datetime <  $3
          ${identitySelectorHelper(CarpoolTypeEnum.DRIVER, identities)}
          ${where_positions.length ? `AND (${where_positions})` : ""}

        UNION ALL

        SELECT
          'passenger' as type,
          SUBSTR((cc.start_datetime AT TIME ZONE $${values.length})::text, 0, 11) AS date,
          cc.start_datetime AT TIME ZONE $${values.length} AS datetime,
          cc.distance,
          passenger_contribution AS payment
        FROM carpool_v2.carpools AS cc
        JOIN carpool_v2.status AS cs ON cc._id = cs.carpool_id
        WHERE
          cc.operator_id = $1::int
          AND cs.acquisition_status = 'processed'
          AND cs.fraud_status = 'passed'
          -- AND cs.anomaly_status = 'passed'
          AND cc.start_datetime >= $2
          AND cc.start_datetime <  $3
          ${identitySelectorHelper(CarpoolTypeEnum.PASSENGER, identities)}
          ${where_positions.length ? `AND (${where_positions})` : ""}
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
      text,
      values,
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
