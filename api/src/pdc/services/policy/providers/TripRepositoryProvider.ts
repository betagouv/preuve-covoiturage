import { provider } from '@ilos/common/index.ts';
import { PostgresConnection } from '@ilos/connection-postgres/index.ts';
import { CarpoolInterface, PolicyInterface, TripRepositoryProviderInterfaceResolver } from '../interfaces/index.ts';

@provider({
  identifier: TripRepositoryProviderInterfaceResolver,
})
export class TripRepositoryProvider implements TripRepositoryProviderInterfaceResolver {
  public readonly table = 'carpool_v2.carpools';
  public readonly geoTable = 'carpool_v2.geo';
  public readonly statusTable = 'carpool_v2.status';
  public readonly operatorTable = 'operator.operators';
  public readonly oldCarpoolTable = 'carpool.carpools';
  public readonly incentiveTable = 'policy.incentives';
  public readonly getComFunction = 'territory.get_com_by_territory_id';
  public readonly getMillesimeFunction = 'geo.get_latest_millesime';

  constructor(protected connection: PostgresConnection) {}

  async *findTripByGeo(
    coms: string[],
    from: Date,
    to: Date,
    batchSize = 300,
    override = true,
    policy_id?: number,
  ): AsyncGenerator<CarpoolInterface[], void, void> {
    const query = {
      text: `
        SELECT
          oo.uuid as operator_uuid,
          cc.operator_trip_id,
          cc.operator_id,
          cc.operator_journey_id,
          cc.operator_class,
          cc.passenger_contribution,
          cc.passenger_identity_key,
          cc.passenger_travelpass_user_id IS NOT NULL as passenger_has_travel_pass,
          cc.passenger_over_18 as passenger_is_over_18,
          cc.passenger_seats as seats,
          cc.driver_revenue,
          cc.driver_identity_key,
          cc.driver_travelpass_user_id IS NOT NULL as driver_has_travel_pass,
          cc.start_datetime as datetime,
          cc.distance,
          row_to_json(
            geo.get_by_code(
              co.start_geo_code::varchar,
              geo.get_latest_millesime_or(EXTRACT(year FROM cc.start_datetime)::smallint)
            )
          ) as start,
          row_to_json(
            geo.get_by_code(
              co.end_geo_code::varchar,
              geo.get_latest_millesime_or(EXTRACT(year FROM cc.start_datetime)::smallint)
            )
          ) as end,
          ST_X(cc.start_position::geometry)::numeric as start_lon,
          ST_Y(cc.start_position::geometry)::numeric as start_lat,
          ST_X(cc.end_position::geometry)::numeric as end_lon,
          ST_Y(cc.end_position::geometry)::numeric as end_lat
        FROM ${this.table} cc
        JOIN ${this.geoTable} co
          ON co.carpool_id = cc._id
        JOIN ${this.operatorTable} oo
          ON oo._id = cc.operator_id
        JOIN ${this.statusTable} cs
          ON cs.carpool_id = cc._id
        ${
          override
            ? ''
            : `
              LEFT JOIN ${this.incentiveTable} pi
                ON
                  cc.operator_journey_id = pi.operator_journey_id
                  AND cc.operator_id = pi.operator_id
                  AND pi.policy_id = $4::int
            `
        }
        WHERE
          cc.start_datetime >= $2::timestamp
          AND cc.start_datetime < $3::timestamp
          AND (
            co.start_geo_code = ANY($1::varchar[])
            OR co.end_geo_code = ANY($1::varchar[])
          )
          ${override ? '' : 'AND pi._id IS NULL'}
        ORDER BY cc.start_datetime ASC
      `,
      values: [coms, from, to, ...(!override && policy_id ? [policy_id] : [])],
    };
    // TODO status

    yield* this.queryAndYieldRows(query, batchSize);
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

    yield* this.findTripByGeo(com, from, to, batchSize, override, policy._id);
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
