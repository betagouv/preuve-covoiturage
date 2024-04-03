import { provider } from '@ilos/common';
import { PoolClient, PostgresConnection } from '@ilos/connection-postgres';
import { Id, Position, UpsertableCarpoolGeo } from '../interfaces';
import sql, { raw } from '../helpers/sql';

@provider()
export class CarpoolGeoRepository {
  readonly table = 'carpool_v2.geo';
  readonly carpoolTable = 'carpool_v2.carpools';

  constructor(protected connection: PostgresConnection) {}

  async findProcessable(
    search: { limit: number; from: Date; to: Date },
    client: PoolClient,
  ): Promise<Array<{ carpool_id: Id; start: Position; end: Position }>> {
    const query = sql`
        SELECT 
          cc._id,
          ST_X(cc.start_position::geometry)::numeric as start_lon,
          ST_Y(cc.start_position::geometry)::numeric as start_lat,
          ST_X(cc.end_position::geometry)::numeric as end_lon,
          ST_Y(cc.end_position::geometry)::numeric as end_lat
        FROM ${raw(this.carpoolTable)} cc
        LEFT JOIN ${raw(this.table)} cg
          ON cg.carpool_id = cc._id
        WHERE 
          cc.start_datetime >= ${search.from} AND
          cc.start_datetime < ${search.to} AND
          cg._id IS NULL
        ORDER BY cc.start_datetime
        LIMIT ${search.limit}
    `
    const result = await client.query(query);
    return result.rows.map(r => ({
      carpool_id: r._id,
      start: {
        lat: parseFloat(r.start_lat),
        lon: parseFloat(r.start_lon),
      },
      end: {
        lat: parseFloat(r.end_lat),
        lon: parseFloat(r.end_lon),
      },
    }));
  }

  public async upsert(data: UpsertableCarpoolGeo, client: PoolClient): Promise<void> {
    const sqlQuery = sql`
      INSERT INTO ${raw(this.table)} (
        carpool_id, start_geo_code, end_geo_code, errors
      ) VALUES (
        ${data.carpool_id},
        ${'start_geo_code' in data ? data.start_geo_code : null},
        ${'end_geo_code' in data ? data.end_geo_code : null},
        ${JSON.stringify('error' in data ? [data.error] : [])}
      )
      ON CONFLICT (carpool_id)
      DO UPDATE
      SET
        start_geo_code = excluded.start_geo_code,
        end_geo_code = excluded.end_geo_code,
        errors = geo.errors || excluded.errors::jsonb
    `;
    await client.query(sqlQuery);
  }
}
