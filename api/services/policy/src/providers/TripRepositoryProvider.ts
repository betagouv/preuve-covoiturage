import { promisify } from 'util';
import { provider } from '@ilos/common';
import { PostgresConnection, Cursor } from '@ilos/connection-postgres';

import { TripRepositoryProviderInterface, TripRepositoryProviderInterfaceResolver, TripInterface } from '../interfaces';

@provider({
  identifier: TripRepositoryProviderInterfaceResolver,
})
export class TripRepositoryProvider implements TripRepositoryProviderInterface {
  public readonly table = 'policy.trips';

  constructor(protected connection: PostgresConnection) {}

  async refresh(): Promise<void> {
    await this.connection.getClient().query(`REFRESH MATERIALIZED VIEW ${this.table}`);
    return;
  }

  async listApplicablePoliciesId(): Promise<number[]> {
    const query = {
      text: `
        SELECT
          distinct pp 
        FROM ${this.table} as pt,
        UNNEST(pt.processable_policies) as pp
      `,
      values: [],
    };
    const results = await this.connection.getClient().query(query);
    return results.rows.map((r) => r.pp);
  }

  async *findTripByPolicy(policy_id: number, batchSize = 100): AsyncGenerator<TripInterface[], void, void> {
    const query = {
      text: `
      SELECT
        trip_id,
        MIN(datetime) as datetime,
        json_agg(
          json_build_object(
            'identity_uuid', identity_uuid,
            'carpool_id', carpool_id,
            'operator_id', operator_id,
            'operator_class', operator_class,
            'is_over_18', is_over_18,
            'is_driver', is_driver,
            'has_travel_pass', has_travel_pass,
            'datetime', datetime,
            'start_insee', start_insee,
            'end_insee', end_insee,
            'seats', seats,
            'duration', duration,
            'distance', distance,
            'cost', cost,
            'start_territory_id', start_territory_id,
            'end_territory_id', end_territory_id
          )
        ) as people
      FROM ${this.table} as pt
      WHERE $1::int = ANY(pt.processable_policies)
      AND pt.carpool_status = 'ok'::carpool.carpool_status_enum
      GROUP BY trip_id;
      `,
      values: [policy_id],
    };

    const client = await this.connection.getClient().connect();
    const cursor = client.query(new Cursor(query.text, query.values));
    const promisifiedCursorRead = promisify(cursor.read.bind(cursor));

    let count = 0;
    do {
      try {
        const rows = await promisifiedCursorRead(batchSize);
        count = rows.length;
        if (count > 0) {
          yield rows;
        }
      } catch (e) {
        cursor.close(() => client.release());
        throw e;
      }
    } while (count > 0);
    cursor.close(() => client.release());
  }
}
