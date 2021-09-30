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

  async *findTripByPolicy(
    policy: ProcessableCampaign,
    batchSize = 100,
    overrideFrom?: Date,
  ): AsyncGenerator<TripInterface[], void, void> {
    const query = {
      text: `
        WITH d AS (
            SELECT unnest(territory.get_descendants(array[$3::int])) _id
        ),
        trips AS (
          SELECT * FROM ${this.table} pt
          INNER JOIN d
            ON pt.start_territory_id = d._id
            AND pt.end_territory_id = d._id
          WHERE
              pt.datetime >= $1::timestamp AND pt.datetime < $2::timestamp
              AND pt.carpool_status = 'ok'::carpool.carpool_status_enum
        ),
        t_start AS (
            SELECT
              start_territory_id, start_territory_id || territory.get_ancestors(ARRAY[cc.start_territory_id]) ancestors
            FROM (SELECT distinct start_territory_id FROM trips) cc
        ),
        t_end AS (
            SELECT
              end_territory_id, end_territory_id || territory.get_ancestors(ARRAY[cc.end_territory_id]) ancestors
            FROM (SELECT distinct end_territory_id FROM trips) cc
        )
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
              'seats', pt.seats,
              'duration', pt.duration,
              'distance', pt.distance,
              'cost', pt.cost,
              'start_territory_id', t_start.ancestors,
              'end_territory_id', t_end.ancestors
            )
          ) AS people
          FROM trips pt
          LEFT JOIN policy.incentives pi
            ON pt.carpool_id = pi.carpool_id
            AND pi.policy_id = $4::int
          LEFT JOIN t_start
            ON pt.start_territory_id = t_start.start_territory_id
          LEFT JOIN t_end
            ON pt.end_territory_id = t_end.end_territory_id
          ${overrideFrom ? 'AND pi.carpool_id IS NULL AND pt.datetime >= $5::timestamp' : ''}

          GROUP BY pt.acquisition_id
          ORDER BY min(pt.datetime) ASC
          `,
      values: [
        policy.start_date,
        policy.end_date,
        policy.territory_id,
        policy.policy_id,
        ...(overrideFrom ? [overrideFrom] : []),
      ],
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
