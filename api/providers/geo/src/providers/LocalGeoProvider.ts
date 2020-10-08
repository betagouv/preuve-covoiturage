import { PostgresConnection } from '@ilos/connection-postgres';
import { NotFoundException, provider } from '@ilos/common';

import { PointInterface, InseeCoderInterface } from '../interfaces';

@provider()
export class LocalGeoProvider implements InseeCoderInterface {
  constructor(protected connection: PostgresConnection) {}

  async positionToInsee(geo: PointInterface): Promise<string> {
    const { lat, lon } = geo;

    const result = await this.connection.getClient().query({
      text: `
        SELECT
          tc.value AS value
        FROM territory.territories AS tt
        JOIN territory.territory_codes AS tc
        ON tc.territory_id = tt._id AND tc.type = 'insee'
        WHERE
          tt.geo IS NOT NULL AND
          ST_INTERSECTS(tt.geo, ST_POINT($1::float, $2::float))
        ORDER BY ST_Area(tt.geo, true) ASC
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
