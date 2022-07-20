import { promisify } from 'util';
import { provider } from '@ilos/common';
import { PostgresConnection, Cursor } from '@ilos/connection-postgres';

import { TripRepositoryProviderInterfaceResolver } from '../interfaces';
import { CarpoolInterface, PolicyInterface } from '~/engine/interfaces';

@provider({
  identifier: TripRepositoryProviderInterfaceResolver,
})
export class TripRepositoryProvider implements TripRepositoryProviderInterfaceResolver {
  public readonly table = 'policy.trips';
  public readonly incentiveTable = 'policy.incentives';
  public readonly getComFunction = 'territory.get_com_by_territory_id';
  public readonly getMillesimeFunction = 'geo.get_latest_millesime';

  constructor(protected connection: PostgresConnection) {}

  // TODO operator_siret
  async *findTripByPolicy(
    policy: PolicyInterface,
    from: Date,
    to: Date,
    batchSize = 100,
    override = false,
  ): AsyncGenerator<CarpoolInterface[], void, void> {
    const yearResult = await this.connection.getClient().query(`SELECT * from ${this.getMillesimeFunction}() as year`);
    const year = yearResult.rows[0]?.year;

    const comRes = await this.connection.getClient().query({
      text: `
        SELECT * FROM ${this.getComFunction}($1::int, $2::smallint)
      `,
      values: [policy.territory_id, year],
    });

    const com = comRes.rowCount ? comRes.rows.map((r) => r.com) : [];

    const query = {
      text: `
        SELECT
          json_agg(
            json_build_object(
              '_id', t.carpool_id,
              'trip_id', t.trip_id,
              'identity_uuid', t.identity_uuid,
              'operator_siret', t.operator_siret,
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
          ORDER BY min(t.datetime) ASC
      `,
      values: override ? [com, from, to] : [com, from, to, policy._id],
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

    // done
    cursor.close(() => client.release());
  }
}
