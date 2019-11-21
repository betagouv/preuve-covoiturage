import { provider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';
import { IdentityInterface } from '../shared/common/interfaces/IdentityInterface';

import {
  IdentityRepositoryProviderInterface,
  IdentityRepositoryProviderInterfaceResolver,
} from '../interfaces/IdentityRepositoryProviderInterface';

/*
 * Trip specific repository
 */
@provider({
  identifier: IdentityRepositoryProviderInterfaceResolver,
})
export class IdentityRepositoryProvider implements IdentityRepositoryProviderInterface {
  public readonly table = 'carpool.identities';

  constructor(public connection: PostgresConnection) {}

  /**
   *  Save an identity on table and return _id and uuid
   */
  public async create(identity: IdentityInterface): Promise<{ _id: number, uuid: string }> {
    const results = await this.connection.getClient().query({
      text: `
        INSERT INTO ${this.table}
        (
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
        ) VALUES ( $1, $2, $3, $4, $5, $6, $7, $8, $9, $10 )
        RETURNING _id, uuid
      `,
      values: [
        identity.phone,
        identity.phone_trunc,
        identity.operator_user_id,
        identity.firstname,
        identity.lastname,
        identity.email,
        identity.company,
        identity.travel_pass_name,
        identity.travel_pass_user_id,
        identity.over_18,
      ],
    });

    if (!results.rowCount) {
      throw new Error('Failed to insert identity');
    }

    return results[0];
  }

  public async delete(_id: number): Promise<void> {
    const results = await this.connection.getClient().query({
      text: `DELETE FROM ${this.table} WHERE _id = $1`,
      values: [
        _id,
      ],
    });

    if (!results.rowCount) {
      throw new Error('Failed to delete identity');
    }

    return;
  }
}
