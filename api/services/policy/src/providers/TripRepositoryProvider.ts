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
  public readonly incentiveTable = 'policy.incentives';
  public readonly getComFunction = 'territory.get_com_by_territory_id';

  constructor(protected connection: PostgresConnection) {}

  async listApplicablePoliciesId(): Promise<number[]> {
    const results = await this.connection.getClient().query("SELECT _id FROM policy.policies WHERE status = 'active'");
    return results.rows.map((r) => r._id);
  }

  async *findTripByPolicy(
    policy: ProcessableCampaign,
    from: Date,
    to: Date,
    batchSize = 100,
    override = false,
  ): AsyncGenerator<TripInterface[], void, void> {
    const comRes = await this.connection.getClient().query({
      text: `
        SELECT * FROM ${this.getComFunction}($1::int, $2::smallint)
      `,
      values: [policy.territory_id, from.getFullYear()],
    });

    const com = comRes.rowCount ? comRes.rows.map((r) => r.com) : [];

    const query = {
      text: `
        SELECT
          json_agg(
            json_build_object(
              'identity_uuid', t.identity_uuid,
              'carpool_id', t.carpool_id,
              'trip_id', t.trip_id,
              'operator_id', t.operator_id,
              'operator_class', t.operator_class,
              'is_over_18', t.is_over_18,
              'is_driver', t.is_driver,
              'has_travel_pass', t.has_travel_pass,
              'datetime', t.datetime,
              'seats', t.seats,
              'duration', t.duration,
              'distance', t.distance,
              'cost', t.cost,
              'start', t.carpool_start,
              'end', t.carpool_end
            )
          ) AS people
          FROM ${this.table} t
          ${
            override
              ? ''
              : `
          LEFT JOIN ${this.incentiveTable} pi
            ON t.carpool_id = pi.carpool_id
            AND pi.policy_id = $4::int
          `
          }
          WHERE
            (t.start_geo_code = ANY($1::varchar[]) OR t.end_geo_code = ANY($1::varchar[])) AND
            t.datetime >= $2::timestamp AND
            t.datetime < $3::timestamp AND
            t.carpool_status = 'ok'::carpool.carpool_status_enum
            ${override ? '' : 'AND pi.carpool_id IS NULL'}
          GROUP BY t.acquisition_id
          ORDER BY min(t.datetime) ASC
      `,
      values: override ? [com, from, to] : [com, from, to, policy.policy_id],
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

    // done
    cursor.close(() => client.release());
  }
}
