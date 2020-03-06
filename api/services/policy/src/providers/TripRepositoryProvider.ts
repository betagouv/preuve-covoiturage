import { provider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';

import { TripRepositoryProviderInterface, TripRepositoryProviderInterfaceResolver, TripInterface } from '../interfaces';

@provider({
  identifier: TripRepositoryProviderInterfaceResolver,
})
export class TripRepositoryProvider implements TripRepositoryProviderInterface {
  public readonly table = 'policy.trips';

  constructor(protected connection: PostgresConnection) {}

  async findTripsById(trip_ids: string[]): Promise<TripInterface[]> {
    const results = await this.connection.getClient().query(`
      SELECT
        trip_id,
        identity_uuid,
        carpool_id,
        operator_id,
        operator_class,
        is_over_18,
        is_driver,
        has_travel_pass,
        datetime,
        start_insee,
        end_insee,
        seats,
        duration,
        distance,
        cost,
        start_territory_id,
        end_territory_id
      FROM ${this.table}
      WHERE trip_id IN ('${trip_ids.join("','")}')
      ORDER BY trip_id
    `);

    if (results.rowCount < 1) {
      return;
    }

    // TODO group by trip_id
    const iterator = results.rows
      .reduce((acc, trip, idx) => {
        const value = acc.get(trip.trip_id) || [];
        value.push(trip);
        acc.set(trip.trip_id, value);

        return acc;
      }, new Map())
      .values();

    return [...iterator].map((tuple) => {
      let hasDriver = false;

      const trip = tuple.reduce(
        (acc, row) => {
          if (row.is_driver && hasDriver) {
            return acc;
          }

          if (row.is_driver && !hasDriver) {
            hasDriver = true;
          }

          acc.people.push(row);
          acc.territories.add(row.start_territory_id);
          acc.territories.add(row.end_territory_id);
          acc.datetime =
            acc.datetime === null ? row.datetime : acc.datetime > row.datetime ? row.datetime : acc.datetime;

          return acc;
        },
        {
          territories: new Set(),
          datetime: null,
          people: [],
        },
      );

      return {
        ...trip,
        territories: [...trip.territories],
      };
    });
  }
}
