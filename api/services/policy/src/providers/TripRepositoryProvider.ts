import { promisify } from 'util';
import { provider } from '@ilos/common';
import { PostgresConnection, Cursor } from '@ilos/connection-postgres';

import { TripRepositoryProviderInterface, TripRepositoryProviderInterfaceResolver, TripInterface } from '../interfaces';
import { ProcessableCampaign } from '../engine/ProcessableCampaign';

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

  async *findTripByPolicy(policy: ProcessableCampaign, batchSize = 100): AsyncGenerator<TripInterface[], void, void> {
    const query = {
      text: `
      SELECT
        json_agg(
          json_build_object(
            'identity_uuid', pt.identity_uuid,
            'carpool_id', pt.carpool_id,
            'operator_id', pt.operator_id,
            'operator_class', pt.operator_class,
            'is_over_18', pt.is_over_18,
            'is_driver', pt.is_driver,
            'has_travel_pass', pt.has_travel_pass,
            'datetime', pt.datetime,
            'start_insee', pt.start_insee,
            'end_insee', pt.end_insee,
            'seats', pt.seats,
            'duration', pt.duration,
            'distance', pt.distance,
            'cost', pt.cost,
            'start_territory_id', pt.start_territory_id,
            'end_territory_id', pt.end_territory_id
          )
        ) as people
      FROM ${this.table} as pt
      LEFT JOIN policy.incentives as pi ON pi.carpool_id = pt.carpool_id
      WHERE pt.datetime >= $1::timestamp AND pt.datetime <= $2::timestamp
      AND pt.carpool_status = 'ok'::carpool.carpool_status_enum
      AND (
        $3::int = ANY(pt.start_territory_id)
        OR $3::int = ANY(pt.end_territory_id)
      )
      AND pi.carpool_id IS NULL
      GROUP BY trip_id;
      `,
      values: [policy.start_date, policy.end_date, policy.territory_id],
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
          yield [
            ...rows.map(
              (r) => new TripInterface(...r.people.map((rp) => ({ ...rp, datetime: new Date(rp.datetime) }))),
            ),
          ];
        }
      } catch (e) {
        cursor.close(() => client.release());
        throw e;
      }
    } while (count > 0);
    cursor.close(() => client.release());
  }
}
