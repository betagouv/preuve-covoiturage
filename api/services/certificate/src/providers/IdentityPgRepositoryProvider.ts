import { provider, NotFoundException } from '@ilos/common';

import {
  IdentityRepositoryProviderInterfaceResolver,
  IdentityRepositoryProviderInterface,
  IdentityParams,
} from '../interfaces/IdentityRepositoryProviderInterface';
import { IdentityInterface } from '../shared/common/interfaces/IdentityInterface';
import { PostgresConnection } from '@ilos/connection-postgres/dist';

@provider({
  identifier: IdentityRepositoryProviderInterfaceResolver,
})
export class IdentityPgRepositoryProvider implements IdentityRepositoryProviderInterface {
  private table = 'carpool.identities';

  constructor(private pg: PostgresConnection) {}

  async find(params: IdentityParams): Promise<IdentityInterface> {
    const q = {
      text: `
        SELECT
          _id,
          uuid,
          phone,
          phone_trunc,
          operator_user_id,
          firstname,
          lastname,
          email,
          company,
          travel_pass_name,
          travel_pass_user_id,
          over_18
        FROM ${this.table}
        WHERE {{WHERE}}
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

    return res.rows[0];
  }
}
