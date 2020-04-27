import { provider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';

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
  async find(params: { identity: number; start_at: Date; end_at: Date }): Promise<CarpoolInterface[]> {
    const { identity, start_at, end_at } = params;

    // fetch the number of kilometers per month
    const result = await this.connection.getClient().query({
      text: `
        SELECT
          to_char(cc.datetime,'MM') AS m,
          extract(year from cc.datetime) AS y,
          sum(cc.distance::float)/1000 as km,
          sum(pi.amount::float)/100 as eur
        FROM ${this.table} AS cc
        LEFT JOIN ${this.incentive_table} AS pi
        ON cc._id = pi.carpool_id
        WHERE cc.identity_id = $1
        AND cc.datetime >= $2 AND cc.datetime <= $3
        GROUP BY (m, y)
        ORDER BY y DESC, m DESC
      `,
      values: [identity, start_at, end_at],
    });

    return result.rows;
  }
}
