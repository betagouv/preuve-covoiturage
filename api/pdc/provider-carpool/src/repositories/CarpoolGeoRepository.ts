import { provider } from '@ilos/common';
import { PoolClient, PostgresConnection } from '@ilos/connection-postgres';
import { UpsertableCarpoolGeo } from '../interfaces';
import sql, { raw } from '../helpers/sql';

@provider()
export class CarpoolGeoRepository {
  readonly table = 'carpool_v2.geo';

  constructor(protected connection: PostgresConnection) {}

  public async upsert(data: UpsertableCarpoolGeo, client?: PoolClient): Promise<void> {
    const cl = client ?? this.connection.getClient();
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
    await cl.query(sqlQuery);
  }
}
