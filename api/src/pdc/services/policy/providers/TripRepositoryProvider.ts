import { provider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';

import { CarpoolInterface, PolicyInterface, TripRepositoryProviderInterfaceResolver } from '../interfaces';

@provider({
  identifier: TripRepositoryProviderInterfaceResolver,
})
export class TripRepositoryProvider implements TripRepositoryProviderInterfaceResolver {
  public readonly table = 'policy.trips';
  public readonly incentiveTable = 'policy.incentives';
  public readonly getComFunction = 'territory.get_com_by_territory_id';
  public readonly getMillesimeFunction = 'geo.get_latest_millesime';

  constructor(protected connection: PostgresConnection) {}

  async *findTripByGeo(coms: string[], from: Date, to: Date): AsyncGenerator<CarpoolInterface[], void, void> {
    const query = {
      text: `
        SELECT
          t.carpool_id as _id,
          t.operator_trip_id,
          t.operator_uuid,
          t.operator_class,
          t.passenger_contribution,
          t.passenger_identity_key,
          t.passenger_has_travel_pass,
          t.passenger_is_over_18,
          t.driver_payment,
          t.driver_identity_key,
          t.driver_has_travel_pass,
          t.datetime,
          t.seats,
          t.duration,
          t.distance,
          t.cost,
          t.carpool_start as start,
          t.carpool_end as end,
          t.start_geo_code
        FROM ${this.table} t
        WHERE
          (t.start_geo_code = ANY($1::varchar[]) OR t.end_geo_code = ANY($1::varchar[]))
          AND t.datetime >= $2::timestamp
          AND t.datetime < $3::timestamp
          AND t.carpool_status = 'ok'
        ORDER BY t.datetime ASC
      `,
      values: [coms, from, to],
    };

    yield* this.queryAndYieldRows(query, 300);
  }

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

    const com: string[] = comRes.rowCount ? comRes.rows.map((r) => r.com) : [];

    const query = {
      text: `
        SELECT
          t.carpool_id as _id,
          t.operator_trip_id,
          t.operator_uuid,
          t.operator_class,
          t.passenger_contribution,
          t.passenger_identity_key,
          t.passenger_has_travel_pass,
          t.passenger_is_over_18,
          t.passenger_meta,
          t.driver_payment,
          t.driver_identity_key,
          t.driver_has_travel_pass,
          t.driver_meta,
          t.datetime,
          t.seats,
          t.duration,
          t.distance,
          t.cost,
          t.carpool_start as start,
          t.carpool_end as end
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
          (t.start_geo_code = ANY($1::varchar[]) OR t.end_geo_code = ANY($1::varchar[]))
          AND t.datetime >= $2::timestamp
          AND t.datetime < $3::timestamp
          AND ( t.carpool_status = 'ok'::carpool.carpool_status_enum 
                or 
                t.carpool_status = 'fraudcheck_error'::carpool.carpool_status_enum)
          ${override ? '' : 'AND pi.carpool_id IS NULL'}
        ORDER BY t.datetime ASC
        `,
      values: override ? [com, from, to] : [com, from, to, policy._id],
    };

    yield* this.queryAndYieldRows(query, batchSize);
  }

  private async *queryAndYieldRows(
    query: { text: string; values: (number | Date | string[])[] },
    batchSize: number,
  ): AsyncGenerator<CarpoolInterface[], void, void> {
    const cursor = await this.connection.getCursor(query.text, query.values);
    let count = 0;
    do {
      try {
        const rows = await cursor.read(batchSize);
        count = rows.length;
        if (count > 0) {
          yield rows;
        }
      } catch (e) {
        await cursor.release();
        throw e;
      }
    } while (count > 0);

    // done
    await cursor.release();
  }
}
