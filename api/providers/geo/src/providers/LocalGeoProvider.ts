import { PostgresConnection } from '@ilos/connection-postgres';
import { NotFoundException, provider } from '@ilos/common';

import { PointInterface, InseeCoderInterface } from '../interfaces';

@provider()
export class LocalGeoProvider implements InseeCoderInterface {
  protected table = 'geo.perimeters';

  constructor(protected connection: PostgresConnection) {}

  async positionToInsee(geo: PointInterface): Promise<string> {
    const { lat, lon } = geo;

    const result = await this.connection.getClient().query({
      text: `
        SELECT
          com as value
        FROM ${this.table}
        WHERE
          geom IS NOT NULL AND
          ST_INTERSECTS(geom, ST_POINT($1::float, $2::float)::GEOGRAPHY)
        ORDER BY surface ASC, year DESC
        LIMIT 1
      `,
      values: [lon, lat],
    });

    if (result.rowCount === 0) {
      throw new NotFoundException();
    }

    return result.rows[0].value;
  }
}
