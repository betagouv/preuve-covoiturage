import { provider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';
import {
  CarpoolRepositoryProviderInterface,
  CarpoolRepositoryProviderInterfaceResolver,
  FindParamsInterface,
} from '../interfaces/CarpoolRepositoryProviderInterface';
import { CarpoolInterface, DBCarpoolInterface } from '../shared/certificate/common/interfaces/CarpoolInterface';
import { PointInterface } from '../shared/common/interfaces/PointInterface';

@provider({
  identifier: CarpoolRepositoryProviderInterfaceResolver,
})
export class CarpoolPgRepositoryProvider implements CarpoolRepositoryProviderInterface {
  constructor(protected connection: PostgresConnection) {}

  /**
   * Find all carpools for an identity on a given period of time
   */
  async find(params: FindParamsInterface): Promise<CarpoolInterface[]> {
    const { personUUID, operator_id, tz, start_at, end_at, positions = [], radius = 1000 } = params;

    const values: any[] = [personUUID, operator_id, start_at, end_at];

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

    // TODO check driver_revenue / passenger_contribution normalisation

    const text = `
      WITH
        trips AS (
          SELECT
            DISTINCT tl.trip_id,
            'driver' AS type,
            SUBSTR((datetime AT TIME ZONE $${values.length})::text, 0, 11) AS date,
            journey_start_datetime AT TIME ZONE $${values.length} AS datetime,
            journey_distance AS distance,
            COALESCE(driver_revenue, 0) AS euros
          FROM trip.list tl
          INNER JOIN carpool.carpools cc ON tl.trip_id = cc.trip_id
          WHERE tl.operator_id = $2::int
            AND cc.is_driver = true
            AND cc.status = 'ok'
            AND tl.driver_id = $1::uuid
            AND tl.journey_start_datetime >= $3
            AND tl.journey_start_datetime < $4
            ${where_positions.length ? `AND (${where_positions})` : ''}
        UNION
          SELECT
            DISTINCT tl.trip_id,
            'passenger' AS type,
            SUBSTR((datetime AT TIME ZONE $${values.length})::text, 0, 11) AS date,
            journey_start_datetime AT TIME ZONE $${values.length} AS datetime,
            journey_distance AS distance,
            COALESCE(passenger_contribution, 0) AS euros
          FROM trip.list tl
          INNER JOIN carpool.carpools cc ON tl.trip_id = cc.trip_id
          WHERE tl.operator_id = $2::int
            AND cc.is_driver = false
            AND cc.status = 'ok'
            AND tl.passenger_id = $1::uuid
            AND tl.journey_start_datetime >= $3
            AND tl.journey_start_datetime < $4
            ${where_positions.length ? `AND (${where_positions})` : ''}
        )

      SELECT
          type,
          date,
          COUNT(*)::int trips,
          TRUNC(SUM(distance)::decimal/1000, 3)::real AS km,
          TRUNC(SUM(euros)::decimal/100, 2)::real AS euros
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
        km: row.km,
        euros: row.euros,
      }),
    );
  }
}
