/* eslint-disable max-len */
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
    const { personUUID, operator_id, tz, start_at, end_at, positions = [], radius = 1000 } = params;

    // TODO get tz
    const values: any[] = [
      personUUID,
      operator_id,
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
        -- rac = reste à charge : what is left to be subsidised without the person earning money
        passenger AS (
          SELECT
            DISTINCT tl.trip_id,
            'passenger' AS type,
            EXTRACT('YEAR' FROM journey_start_datetime AT TIME ZONE $${values.length}) AS year,
            EXTRACT('MONTH' FROM journey_start_datetime AT TIME ZONE $${values.length}) AS month,
            TRUNC(journey_distance::decimal/1000, 3)::real AS km,
            TRUNC(journey_distance::decimal/1000 * $5::decimal, 3)::real AS max_cost,
            TRUNC(coalesce(passenger_contribution, 0)::decimal/100, 3)::real AS cost,
            TRUNC(coalesce(passenger_incentive_rpc_sum, 0)::decimal/100, 3)::real AS incentives,
            -- rac = what the passenger paid - incentives
            TRUNC(coalesce(passenger_contribution, 0)::decimal/100 - coalesce(passenger_incentive_rpc_sum, 0)::decimal/100, 3)::real AS rac,
            cc.meta->>'payments' as payments
          FROM trip.list tl
          INNER JOIN carpool.carpools cc ON tl.trip_id = cc.trip_id
          WHERE tl.operator_id = $2::int
          AND cc.is_driver = false
          AND tl.passenger_id = $1
          AND tl.journey_start_datetime >= $3 AND tl.journey_start_datetime <= $4
          ${where_positions.length ? `AND (${where_positions})` : ''}
        ),

        driver AS (
          SELECT
            DISTINCT tl.trip_id,
            'driver' AS type,
            EXTRACT('YEAR' FROM journey_start_datetime AT TIME ZONE $${values.length}) AS year,
            EXTRACT('MONTH' FROM journey_start_datetime AT TIME ZONE $${values.length}) AS month,
            TRUNC(journey_distance::decimal/1000, 3)::real AS km,
            TRUNC(journey_distance::decimal/1000 * $5::decimal, 3)::real AS max_cost,
            TRUNC(coalesce(driver_revenue, 0)::decimal/100, 3)::real AS cost,
            TRUNC(coalesce(driver_incentive_rpc_sum, 0)::decimal/100, 3)::real AS incentives,
            -- rac = distance x bareme - money gotten FROM passengers - incentives
            TRUNC(journey_distance::decimal/1000 * $5::decimal - coalesce(driver_revenue, 0)::decimal/100 - coalesce(driver_incentive_rpc_sum, 0)::decimal/100, 3)::real AS rac,
            cc.meta->>'payments' as payments
            FROM trip.list tl
          INNER JOIN carpool.carpools cc ON tl.trip_id = cc.trip_id
          WHERE tl.operator_id = $2::int
          AND cc.is_driver = true
          AND tl.driver_id = $1
          AND tl.journey_start_datetime >= $3 AND tl.journey_start_datetime <= $4
          ${where_positions.length ? `AND (${where_positions})` : ''}
        )

        SELECT * from driver union SELECT * from passenger
    `;

    const result = await this.connection.getClient().query(text, values);

    return result.rows;
  }
}
