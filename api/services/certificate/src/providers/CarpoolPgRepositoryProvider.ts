import { provider, NotFoundException } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';

import {
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

  // TODO replace any output by proper interface
  async find(params: { identity: string; start_at?: Date; end_at?: Date }): Promise<any[]> {
    // identity is a phone number for now!
    const { identity, start_at, end_at } = params;

    // fetch all identities by phone number
    const idResult = await this.connection.getClient().query({
      text: `SELECT * FROM ${this.id_table} WHERE phone IN ($1) LIMIT 1`,
      values: [identity],
    });

    if (idResult.rowCount === 0) {
      throw new NotFoundException(`Identity not found (${identity})`);
    }

    const { identities } = idResult.rows[0];

    // fetch the number of kilometers per month
    const result = await this.connection.getClient().query({
      text: `
        SELECT
          to_char(datetime,'MM') AS m,
          extract(year from datetime) AS y,
          sum(distance::float)/1000 as km,
          sum(amount::float)/100 as eur
        FROM ${this.table} AS cc
        LEFT JOIN ${this.incentive_table} AS pi
        ON cc._id = pi.carpool_id::int
        WHERE identity_id IN (${identities.join(',')})
        AND datetime >= $1 AND datetime <= $2
        GROUP BY (m, y)
        ORDER BY y DESC, m DESC
      `,
      values: [start_at, end_at],
    });

    return result.rows;
  }
}
