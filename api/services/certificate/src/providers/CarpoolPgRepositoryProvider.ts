import { provider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';

import {
  CarpoolRepositoryProviderInterface,
  CarpoolRepositoryProviderInterfaceResolver,
} from '../interfaces/CarpoolRepositoryProviderInterface';

@provider({
  identifier: CarpoolRepositoryProviderInterfaceResolver,
})
export class CarpoolPgRepositoryProvider implements CarpoolRepositoryProviderInterface {
  // TODO make a read-only view for this
  public readonly table = 'carpool.carpools';

  constructor(protected connection: PostgresConnection) {}

  // TODO replace any output by proper interface
  // FIXME operator_user_id as identity.phone for now!
  async find(params: { operator_user_id: string; start_at: Date; end_at: Date }): Promise<any[]> {
    const { operator_user_id, start_at, end_at } = params;
    const result = await this.connection.getClient().query({
      text: `
        SELECT * FROM ${this.table}
        WHERE (identity).phone = $1
        AND datetime $2 AND $3
      `,
      values: [operator_user_id, start_at, end_at],
    });

    return result.rows;
  }
}
