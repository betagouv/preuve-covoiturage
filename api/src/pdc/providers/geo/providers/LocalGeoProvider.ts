import { NotFoundException, provider } from '@ilos/common/index.ts';
import { PostgresConnection } from '@ilos/connection-postgres/index.ts';
import { InseeCoderInterface, PointInterface } from '../interfaces/index.ts';

@provider()
export class LocalGeoProvider implements InseeCoderInterface {
  protected fn = 'geo.get_latest_by_point';
  protected fb = 'geo.get_closest_country';
  protected fbclose = 'geo.get_closest_com';

  constructor(protected connection: PostgresConnection) {}

  async positionToInsee(geo: PointInterface): Promise<string> {
    const { lat, lon } = geo;
    const pool = this.connection.getClient();
    const client = await pool.connect();

    try {
      const resultInCom = await client.query({
        text: `
        SELECT arr
        FROM ${this.fn}($1::float, $2::float)
        WHERE arr <> 'XXXXX'
      `,
        values: [lon, lat],
      });

      if (resultInCom.rowCount > 0) {
        return resultInCom.rows[0].arr;
      }

      const resultOutFr = await client.query({
        text: `
        SELECT arr
        FROM ${this.fb}($1::float, $2::float)
        WHERE com IS NULL
      `,
        values: [lon, lat],
      });

      if (resultOutFr.rowCount > 0) {
        return resultOutFr.rows[0].arr;
      }

      const resultCloseCom = await client.query({
        text: `
        SELECT arr
        FROM ${this.fbclose}($1::float, $2::float,1000)
      `,
        values: [lon, lat],
      });

      if (resultCloseCom.rowCount === 0) {
        throw new NotFoundException();
      }

      return resultCloseCom.rows[0].arr;
    } catch (e) {
      console.error(`[LocalGeoProvider] (${lon},${lat}) ${e.message}`);
      throw e;
    } finally {
      client.release();
    }
  }
}
