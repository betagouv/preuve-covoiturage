import { PostgresConnection } from '@ilos/connection-postgres';
import { NotFoundException, provider } from '@ilos/common';

import { PointInterface, InseeCoderInterface } from '../interfaces';

@provider()
export class LocalGeoProvider implements InseeCoderInterface {
  protected fn = 'geo.get_latest_by_point';
  protected fb = 'geo.get_closest_country';

  constructor(protected connection: PostgresConnection) {}

  async positionToInsee(geo: PointInterface): Promise<string> {
    const { lat, lon } = geo;

    const comResultInFrance = await this.connection.getClient().query({
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

    const comResultOutFrance = await this.connection.getClient().query({
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
  }
}
