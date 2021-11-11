import { provider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';
import {
  CarpoolRepositoryProviderInterface,
  CarpoolRepositoryProviderInterfaceResolver,
  FindParamsInterface,
} from '../interfaces/CarpoolRepositoryProviderInterface';
import { CarpoolInterface } from '../shared/certificate/common/interfaces/CarpoolInterface';
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

    const text = `
        WITH
        trips AS (
          SELECT
            DISTINCT tl.trip_id,
            'driver' AS type,
            journey_start_datetime AS datetime,
            EXTRACT('DOW' FROM journey_start_datetime AT TIME ZONE $${values.length}) = 1 AS lun,
            EXTRACT('DOW' FROM journey_start_datetime AT TIME ZONE $${values.length}) = 2 AS mar,
            EXTRACT('DOW' FROM journey_start_datetime AT TIME ZONE $${values.length}) = 3 AS mer,
            EXTRACT('DOW' FROM journey_start_datetime AT TIME ZONE $${values.length}) = 4 AS jeu,
            EXTRACT('DOW' FROM journey_start_datetime AT TIME ZONE $${values.length}) = 5 AS ven,
            EXTRACT('DOW' FROM journey_start_datetime AT TIME ZONE $${values.length}) = 6 AS sam,
            EXTRACT('DOW' FROM journey_start_datetime AT TIME ZONE $${values.length}) = 0 AS dim,
            EXTRACT('YEAR' FROM journey_start_datetime AT TIME ZONE $${values.length}) AS year,
            EXTRACT('MONTH' FROM journey_start_datetime AT TIME ZONE $${values.length}) AS month,
            EXTRACT('WEEK' FROM journey_start_datetime AT TIME ZONE $${values.length}) AS week,
            EXTRACT('DAY' FROM journey_start_datetime AT TIME ZONE $${values.length}) AS day,
            journey_distance AS distance,
            COALESCE(driver_revenue, 0) AS euros
            FROM trip.list tl
            INNER JOIN carpool.carpools cc ON tl.trip_id = cc.trip_id
            WHERE tl.operator_id = $2::int
            AND cc.is_driver = true
            AND tl.driver_id = $1::uuid
            AND tl.journey_start_datetime >= $3 AND tl.journey_start_datetime < $4
            ${where_positions.length ? `AND (${where_positions})` : ''}
          UNION
          SELECT
            DISTINCT tl.trip_id,
            'passenger' AS type,
            journey_start_datetime AS datetime,
            EXTRACT('DOW' FROM journey_start_datetime AT TIME ZONE $${values.length}) = 1 AS lun,
            EXTRACT('DOW' FROM journey_start_datetime AT TIME ZONE $${values.length}) = 2 AS mar,
            EXTRACT('DOW' FROM journey_start_datetime AT TIME ZONE $${values.length}) = 3 AS mer,
            EXTRACT('DOW' FROM journey_start_datetime AT TIME ZONE $${values.length}) = 4 AS jeu,
            EXTRACT('DOW' FROM journey_start_datetime AT TIME ZONE $${values.length}) = 5 AS ven,
            EXTRACT('DOW' FROM journey_start_datetime AT TIME ZONE $${values.length}) = 6 AS sam,
            EXTRACT('DOW' FROM journey_start_datetime AT TIME ZONE $${values.length}) = 0 AS dim,
            EXTRACT('YEAR' FROM journey_start_datetime AT TIME ZONE $${values.length}) AS year,
            EXTRACT('MONTH' FROM journey_start_datetime AT TIME ZONE $${values.length}) AS month,
            EXTRACT('WEEK' FROM journey_start_datetime AT TIME ZONE $${values.length}) AS week,
            EXTRACT('DAY' FROM journey_start_datetime AT TIME ZONE $${values.length}) AS day,
            journey_distance AS distance,
            COALESCE(passenger_contribution, 0) AS euros
            FROM trip.list tl
            INNER JOIN carpool.carpools cc ON tl.trip_id = cc.trip_id
            WHERE tl.operator_id = $2::int
            AND cc.is_driver = false
            AND tl.passenger_id = $1::uuid
            AND tl.journey_start_datetime >= $3 AND tl.journey_start_datetime < $4
            ${where_positions.length ? `AND (${where_positions})` : ''}
        ),
        ordered_trips AS (
          SELECT * FROM trips
          ORDER BY type, week
        )
        
      SELECT
          type,
          week,
          month,
          SUBSTR((MIN(datetime) AT TIME ZONE 'Europe/Paris')::text, 1, 10) AS datetime,
          COUNT(DISTINCT day)::int uniq_days,
          COUNT(*)::int trips,
          bool_or(lun) AS lun,
          bool_or(mar) AS mar,
          bool_or(mer) AS mer,
          bool_or(jeu) AS jeu,
          bool_or(ven) AS ven,
          bool_or(sam) AS sam,
          bool_or(dim) AS dim,
          TRUNC(SUM(distance)::decimal/1000, 3)::real AS km,
          TRUNC(SUM(euros)::decimal/100, 2)::real AS euros
      FROM ordered_trips
      GROUP BY GROUPING SETS ((type), (type, week), (type, month))
    `;

    const result = await this.connection.getClient().query<CarpoolInterface>(text, values);

    return result.rows;
  }
}
