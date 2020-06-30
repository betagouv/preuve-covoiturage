import { provider, NotFoundException } from '@ilos/common';

import {
  IdentityRepositoryProviderInterfaceResolver,
  IdentityRepositoryProviderInterface,
  IdentityParams,
} from '../interfaces/IdentityRepositoryProviderInterface';
import { PostgresConnection } from '@ilos/connection-postgres/dist';

@provider({
  identifier: IdentityRepositoryProviderInterfaceResolver,
})
export class IdentityPgRepositoryProvider implements IdentityRepositoryProviderInterface {
  private table = 'carpool.identities';

  constructor(private pg: PostgresConnection) {}

  async find(params: IdentityParams): Promise<{ ids: number[]; uuid: string }> {
    const q = {
      text: `
        SELECT
          array_agg(_id) as ids,
          uuid
        FROM ${this.table}
        WHERE {{WHERE}}
        GROUP BY uuid
        LIMIT 1
      `,
      values: [],
    };

    if ('_id' in params) {
      q.text = q.text.replace('{{WHERE}}', '_id = $1');
      q.values.push(params._id);
    } else if ('uuid' in params) {
      q.text = q.text.replace('{{WHERE}}', 'uuid = $1');
      q.values.push(params.uuid);
    } else if ('phone' in params) {
      q.text = q.text.replace('{{WHERE}}', 'phone = $1');
      q.values.push(params.phone);
    } else if ('phone_trunc' in params) {
      q.text = q.text.replace('{{WHERE}}', 'phone_trunc = $1 AND operator_user_id = $2');
      q.values.push(params.phone_trunc);
      q.values.push(params.operator_user_id);
    }

    const res = await this.pg.getClient().query(q);

    if (res.rowCount === 0) {
      throw new NotFoundException();
    }

    console.log('find Identity', res.rows);
    return res.rows[0];
  }
}
