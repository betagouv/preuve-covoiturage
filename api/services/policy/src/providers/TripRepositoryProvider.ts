import { provider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';

import { TripRepositoryProviderInterface, TripRepositoryProviderInterfaceResolver, TripInterface } from '../interfaces';

@provider({
  identifier: TripRepositoryProviderInterfaceResolver,
})
export class TripRepositoryProvider implements TripRepositoryProviderInterface {
  public readonly table = 'policy.trips';

  constructor(protected connection: PostgresConnection) {}

  async getByTripId(trip_id: number): Promise<TripInterface> {
    const query = {
      text: `
        SELECT
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
        FROM ${this.table} WHERE trip_id = $1`,
      values: [trip_id],
    };

    const results = await this.connection.getClient().query(query);

    if (results.rowCount < 1) {
      return;
    }

    let hasDriver = false;

    return results.rows
      .reduce(
        (acc, row) => {
          const { start_territory_id, end_territory_id, ...person } = row;

          if (row.is_driver && hasDriver) {
            return acc;
          } else if (row.is_driver && !hasDriver) {
            hasDriver = true;
          }

          acc.people.push(person);
          acc.territories.add(start_territory_id);
          acc.territories.add(end_territory_id);
          acc.datetime =
            acc.datetime === null ? row.datetime : acc.datetime > row.datetime ? row.datetime : acc.datetime;

          return acc;
        },
        {
          territories: new Set(),
          datetime: null,
          people: [],
        },
      )
      .map((r) => ({ ...r, territories: [...r.territories] }));
  }
}
