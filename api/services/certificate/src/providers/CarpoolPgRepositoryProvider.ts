import { provider, ConfigInterfaceResolver } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';

import { PointInterface } from '../shared/common/interfaces/PointInterface';
import {
  CarpoolInterface,
  CarpoolRepositoryProviderInterface,
  CarpoolRepositoryProviderInterfaceResolver,
  FindParamsInterface,
} from '../interfaces/CarpoolRepositoryProviderInterface';

@provider({
  identifier: CarpoolRepositoryProviderInterfaceResolver,
})
export class CarpoolPgRepositoryProvider implements CarpoolRepositoryProviderInterface {
  constructor(protected connection: PostgresConnection, private config: ConfigInterfaceResolver) {}

  /**
   * Find all carpools for an identity on a given period of time
   *
   * TODO find a more elegant way to use the join on carpool AND policy schemas
   * TODO filter by operator AND territory too
   * TODO replace any output by proper interface
   */
  async find(params: FindParamsInterface): Promise<CarpoolInterface[]> {
    const { identity, operator_id, tz, start_at, end_at, positions = [], radius = 1000 } = params;

    // TODO get tz
    const values: any[] = [
      identity.phone,
      identity.phone_trunc,
      operator_id,
      identity.operator_user_id,
      identity.travel_pass_name,
      identity.travel_pass_user_id,
      start_at,
      end_at,
      this.config.get('trips.ratePerKm'),
    ];

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

    // add Timezone
    values.push(tz || 'GMT');

    const text = `
      WITH
        carpooler AS (
          (
            SELECT uuid FROM carpool.identities
            WHERE phone IS NOT NULL AND phone = $1::varchar
          ) UNION (
            SELECT uuid FROM carpool.identities
            WHERE phone_trunc IS NOT NULL AND phone_trunc = $2::varchar
            AND operator_user_id = $4::varchar
          ) UNION (
            SELECT uuid FROM carpool.identities
            WHERE phone_trunc IS NOT NULL AND phone_trunc = $2::varchar
            AND travel_pass_name = $5::varchar AND travel_pass_user_id = $6::varchar
          )
        ),

        -- rac = reste à charge : what is left to be subsidised without the person earning money
        passenger AS (
          SELECT
            DISTINCT tl.trip_id,
            'passenger' AS type,
            EXTRACT('YEAR' FROM journey_start_datetime AT TIME ZONE $${values.length}) AS year,
            EXTRACT('MONTH' FROM journey_start_datetime AT TIME ZONE $${values.length}) AS month,
            TRUNC(journey_distance::decimal/1000, 3) AS km,
            TRUNC(journey_distance::decimal/1000 * $9::decimal, 3) AS max_cost,
            TRUNC(coalesce(passenger_contribution, 0)::decimal/100, 3) AS cost,
            TRUNC(coalesce(passenger_incentive_rpc_sum, 0)::decimal/100, 3) AS incentives,
            -- rac = what the passenger paid - incentives
            TRUNC(coalesce(passenger_contribution, 0)::decimal/100 - coalesce(passenger_incentive_rpc_sum, 0)::decimal/100, 3) AS rac
          FROM trip.list tl
          INNER JOIN carpooler ON carpooler.uuid = tl.passenger_id
          ${where_positions.length ? 'INNER JOIN carpool.carpools cc ON tl.trip_id = cc.trip_id' : ''}
          WHERE tl.operator_id = $3::int
          AND tl.journey_start_datetime >= $7 AND tl.journey_start_datetime <= $8
          ${where_positions.length ? `AND (${where_positions})` : ''}
        ),

        driver AS (
          SELECT
            DISTINCT tl.trip_id,
            'driver' AS type,
            EXTRACT('YEAR' FROM journey_start_datetime) AS year,
            EXTRACT('MONTH' FROM journey_start_datetime) AS month,
            TRUNC(journey_distance::decimal/1000, 3) AS km,
            TRUNC(journey_distance::decimal/1000 * $9::decimal, 3) AS max_cost,
            TRUNC(coalesce(driver_revenue, 0)::decimal/100, 3) AS cost,
            TRUNC(coalesce(driver_incentive_rpc_sum, 0)::decimal/100, 3) AS incentives,
            -- rac = distance x bareme - money gotten FROM passengers - incentives
            TRUNC(journey_distance::decimal/1000 * $9::decimal - coalesce(driver_revenue, 0)::decimal/100 - coalesce(driver_incentive_rpc_sum, 0)::decimal/100, 3) AS rac
          FROM trip.list tl
          INNER JOIN carpooler ON carpooler.uuid = tl.driver_id
          ${where_positions.length ? 'INNER JOIN carpool.carpools cc ON tl.trip_id = cc.trip_id' : ''}
          WHERE tl.operator_id = $3::int
          AND tl.journey_start_datetime >= $7 AND tl.journey_start_datetime <= $8
          ${where_positions.length ? `AND (${where_positions})` : ''}
        ),

        merged AS (
          SELECT
            trip_id,
            year,
            month,
            km,
            cost,
            incentives,
            rac
          FROM passenger
          union
          SELECT
            -- the driver AS many trips with the same trip_id AS there
            -- is one per passenger. Keep the one with the incentive, drop the others
            DISTINCT on (year, month, trip_id) trip_id,
            year,
            month,
            km,
            cost,
            incentives,
            rac
          FROM driver
          ORDER BY year DESC, month DESC, trip_id, incentives DESC
        )

        SELECT
          year AS y,
          month AS m,
          COUNT(*) AS trips,
          SUM(km) AS km,
          GREATEST(SUM(rac), 0)::real AS rm -- cast to 4-byte float
        FROM merged
        GROUP BY year, month
        ORDER BY year DESC, month DESC;
    `;

    const result = await this.connection.getClient().query(text, values);

    return result.rows;
  }
}
