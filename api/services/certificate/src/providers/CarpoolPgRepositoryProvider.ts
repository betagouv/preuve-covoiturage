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
  public readonly table = 'carpool.carpools';
  public readonly id_table = 'certificate.identities';
  public readonly incentive_table = 'policy.incentives';

  constructor(protected connection: PostgresConnection) {}

  /**
   * Find all carpools for an identity on a given period of time
   *
   * TODO find a more elegant way to use the join on carpool and policy schemas
   * TODO filter by operator and territory too
   * TODO replace any output by proper interface
   */
  async find(params: {
    identity: number;
    start_at: Date;
    end_at: Date;
    positions?: PointInterface[];
    radius?: number;
  }): Promise<CarpoolInterface[]> {
    const { identity, start_at, end_at, positions = [], radius = 1000 } = params;

    const where_positions = positions
      .reduce((prev: string[], pos: PointInterface): string[] => {
        prev.push(`ST_Distance(ST_MakePoint(${pos.lon}, ${pos.lat}), cc.start_position) < ${Math.abs(radius | 0)}`);
        prev.push(`ST_Distance(ST_MakePoint(${pos.lon}, ${pos.lat}), cc.end_position) < ${Math.abs(radius | 0)}`);

        return prev;
      }, [])
      .join(' OR ');

    // fetch the number of kilometers per month
    const result = await this.connection.getClient().query({
      text: `
        SELECT
          to_char(cc.datetime,'MM') AS m,
          extract(year from cc.datetime)::text AS y,
          count(*) as trips,
          sum(cc.distance::float)/1000 as km,
          sum(pi.amount::float)/100 as eur
        FROM ${this.table} AS cc
        LEFT JOIN ${this.incentive_table} AS pi
        ON cc._id = pi.carpool_id
        WHERE cc.identity_id = $1
        AND cc.datetime >= $2 AND cc.datetime <= $3
        ${where_positions.length ? `AND (${where_positions})` : ''}
        GROUP BY (m, y)
        ORDER BY y DESC, m DESC
      `,
      values: [identity, start_at, end_at],
    });

    return result.rows;
  }
}
