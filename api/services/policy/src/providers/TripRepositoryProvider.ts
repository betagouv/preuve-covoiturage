import { provider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';

import { TripRepositoryProviderInterface, TripRepositoryProviderInterfaceResolver, TripInterface } from '../interfaces';

@provider({
  identifier: TripRepositoryProviderInterfaceResolver,
})
export class TripRepositoryProvider implements TripRepositoryProviderInterface {
  public readonly table = 'policy.trips';

  constructor(protected connection: PostgresConnection) {}

  async findByTripId(trip_id: string): Promise<TripInterface> {
    const query = {
      text: `
        SELECT
          identity_uuid,
          carpool_id,
          operator_id::integer,
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
        FROM ${this.table} WHERE trip_id = $1`,
      values: [trip_id],
    };

    const results = await this.connection.getClient().query(query);

    if (results.rowCount < 1) {
      return;
    }

    let hasDriver = false;

    const trip = results.rows.reduce(
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
        acc.datetime = acc.datetime === null ? row.datetime : acc.datetime > row.datetime ? row.datetime : acc.datetime;

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
  }
}
