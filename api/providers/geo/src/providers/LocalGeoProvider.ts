import { NotFoundException, provider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';
import { InseeCoderInterface, PointInterface } from '../interfaces';

@provider()
export class LocalGeoProvider implements InseeCoderInterface {
  protected fn = 'geo.get_latest_by_point';
  protected fb = 'geo.get_closest_country';

  constructor(protected connection: PostgresConnection) {}

  async positionToInsee(geo: PointInterface): Promise<string> {
    const { lat, lon } = geo;
    const pool = this.connection.getClient();
    const client = await pool.connect();

    try {
      const comResultInFrance = await client.query({
        text: `
        SELECT arr
        FROM ${this.fn}($1::float, $2::float)
        WHERE arr <> 'XXXXX'
      `,
        values: [lon, lat],
      });

      if (comResultInFrance.rowCount > 0) {
        return comResultInFrance.rows[0].arr;
      }

      const comResultOutFrance = await client.query({
        text: `
        SELECT arr
        FROM ${this.fb}($1::float, $2::float)
        WHERE com IS NULL
      `,
        values: [lon, lat],
      });

      if (comResultOutFrance.rowCount === 0) {
        throw new NotFoundException();
      }

      return comResultOutFrance.rows[0].arr;
    } catch (e) {
      console.error(`[LocalGeoProvider] ${e.message}`);
      throw e;
    } finally {
      client.release();
    }
  }
}
