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
          _id
        FROM common.insee
        WHERE
          ST_CONTAINS(geo::geometry, $1::geography::geometry)
        ORDER BY ST_Area(geo::geometry) ASC
        LIMIT 1
      `,
      values: [`POINT(${lon} ${lat})`],
    });

    if (result.rowCount === 0) {
      throw new NotFoundException();
    }

    return result.rows[0]._id;
  }
}
