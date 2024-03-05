import { provider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';
import {
  CarpoolRepositoryProviderInterface,
  CarpoolRepositoryProviderInterfaceResolver,
  FindParamsInterface,
} from '../interfaces/CarpoolRepositoryProviderInterface';
import { CarpoolInterface, DBCarpoolInterface } from '@shared/certificate/common/interfaces/CarpoolInterface';
import { PointInterface } from '@shared/common/interfaces/PointInterface';

@provider({
  identifier: CarpoolRepositoryProviderInterfaceResolver,
})
export class CarpoolPgRepositoryProvider implements CarpoolRepositoryProviderInterface {
  private table = 'carpool.carpools' as const;

  constructor(protected connection: PostgresConnection) {}

  /**
   * Find all carpools for an identity on a given period of time
   */
  async find(params: FindParamsInterface): Promise<CarpoolInterface[]> {
    const { identities, operator_id, tz, start_at, end_at, positions = [], radius = 1000 } = params;

    const values: any[] = [identities, operator_id, start_at, end_at];

    const where_positions = positions
      .reduce((prev: string[], pos: PointInterface): string[] => {
        prev.push(
          `ST_Distance(ST_MakePoint(\$${values.length + 1}, \$${values.length + 2}), cc.start_position) < \$${
            values.length + 3
          }`,
        );
        values.push(pos.lon, pos.lat, Math.abs(radius | 0));

        prev.push(
          `ST_Distance(ST_MakePoint(\$${values.length + 1}, \$${values.length + 2}), cc.end_position) < \$${
            values.length + 3
          }`,
        );
        values.push(pos.lon, pos.lat, Math.abs(radius | 0));

        return prev;
      }, [])
      .join(' OR ');

    // add Timezone at last position of the values array
    values.push(tz || 'GMT');

    // list trips as driver and passenger for a given identity
    // get the greatest payment amount from the trip, the meta payments
    const text = `
      WITH trips AS (
        SELECT
          cc.trip_id,
          'driver' as type,
          SUBSTR((cc.datetime AT TIME ZONE $${values.length})::text, 0, 11) AS date,
          cc.datetime AT TIME ZONE $${values.length} AS datetime,
          cc.distance,
          GREATEST(
            COALESCE(meta_payments.sum, 0)::int,
            payment
          ) AS payment
        FROM ${this.table} AS cc
        LEFT JOIN LATERAL (
          SELECT SUM(COALESCE(amount, 0)) AS sum
          FROM json_to_recordset(cc.meta->'payments') x (type text, index int, siret text, amount int)
        ) meta_payments ON true
        WHERE
          cc.operator_id = $2::int
          AND cc.is_driver = true
          AND cc.status in ('ok', 'expired')
          AND cc.datetime >= $3
          AND cc.datetime <  $4
          AND cc.identity_id = ANY($1::int[])
          ${where_positions.length ? `AND (${where_positions})` : ''}

        UNION ALL

        SELECT
          cc.trip_id,
          'passenger' as type,
          SUBSTR((cc.datetime AT TIME ZONE $${values.length})::text, 0, 11) AS date,
          cc.datetime AT TIME ZONE $${values.length} AS datetime,
          cc.distance,
          GREATEST(
            COALESCE(meta_payments.sum, 0)::int,
            payment
          ) AS payment
        FROM ${this.table} AS cc
        LEFT JOIN LATERAL (
          SELECT SUM(COALESCE(amount, 0)) AS sum
          FROM json_to_recordset(cc.meta->'payments') x (type text, index int, siret text, amount int)
        ) meta_payments ON true
        WHERE
          cc.operator_id = $2::int
          AND cc.is_driver = false
          AND cc.status in ('ok', 'expired')
          AND cc.datetime >= $3
          AND cc.datetime <  $4
          AND cc.identity_id = ANY($1::int[])
          ${where_positions.length ? `AND (${where_positions})` : ''}
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

    const result = await this.connection.getClient().query<DBCarpoolInterface>(text, values);

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
