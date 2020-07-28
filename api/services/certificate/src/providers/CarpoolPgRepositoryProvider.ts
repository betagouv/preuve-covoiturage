import { provider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';

import { PointInterface } from '../shared/common/interfaces/PointInterface';
import {
  CarpoolInterface,
  CarpoolRepositoryProviderInterface,
  CarpoolRepositoryProviderInterfaceResolver,
} from '../interfaces/CarpoolRepositoryProviderInterface';

@provider({
  identifier: CarpoolRepositoryProviderInterfaceResolver,
})
export class CarpoolPgRepositoryProvider implements CarpoolRepositoryProviderInterface {
  public readonly table = 'trip.list';

  constructor(protected connection: PostgresConnection) {}

  /**
   * Find all carpools for an identity on a given period of time
   *
   * TODO find a more elegant way to use the join on carpool and policy schemas
   * TODO filter by operator and territory too
   * TODO replace any output by proper interface
   */
  async find(params: {
    identity_uuid: string;
    start_at: Date;
    end_at: Date;
    positions?: PointInterface[];
    radius?: number;
  }): Promise<CarpoolInterface[]> {
    const { identity_uuid, start_at, end_at, positions = [], radius = 1000 } = params;

    const values: any[] = [identity_uuid, start_at, end_at];

    const where_positions = positions
      .reduce((prev: string[], pos: PointInterface): string[] => {
        prev.push(
          `ST_Distance(ST_MakePoint(\$${values.length + 1}, \$${values.length + 2}), cc.start_position) < \$${
            values.length + 3
          }`,
        );
        values.push(pos.lon, pos.lat, Math.abs(radius | 0));

        prev.push(
          `ST_Distance(ST_MakePoint(\$${values.length + 1}, \$${values.length + 2}), cc.end_position) < \$${
            values.length + 3
          }`,
        );
        values.push(pos.lon, pos.lat, Math.abs(radius | 0));

        return prev;
      }, [])
      .join(' OR ');

    // fetch the number of kilometers per month
    const text = `
      SELECT
        to_char(tl.journey_start_datetime,'MM') AS m,
        extract(year from tl.journey_start_datetime)::text AS y,
        count(*) as trips,
        sum(tl.journey_distance::float)/1000 as km,
        sum(tl.driver_revenue::float)/100 as eur
      FROM ${this.table} AS tl
      WHERE tl.driver_id = $1 OR tl.passenger_id = $1
      AND tl.journey_start_datetime >= $2 AND tl.journey_start_datetime <= $3
      ${where_positions.length ? `AND (${where_positions})` : ''}
      GROUP BY (m, y)
      ORDER BY y DESC, m DESC
    `;

    const result = await this.connection.getClient().query(text, values);

    return result.rows;
  }
}
