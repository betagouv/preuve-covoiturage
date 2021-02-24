import { provider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';

import { IdentityInterface } from '../shared/common/interfaces/IdentityInterface';
import {
  IdentityRepositoryProviderInterface,
  IdentityRepositoryProviderInterfaceResolver,
  IdentityMetaInterface,
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
  public async create(
    identity: IdentityInterface,
    meta: IdentityMetaInterface,
  ): Promise<{ _id: number; uuid: string }> {
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
          over_18,
          uuid
        ) VALUES ( $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11 )
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
        await this.findUuid(identity, meta),
      ],
    });

    if (!results.rowCount) {
      throw new Error('Failed to insert identity');
    }

    return results.rows[0];
  }

  public async delete(_id: number): Promise<void> {
    const results = await this.connection.getClient().query({
      text: `DELETE FROM ${this.table} WHERE _id = $1`,
      values: [_id],
    });

    if (!results.rowCount) {
      throw new Error('Failed to delete identity');
    }

    return;
  }

  public async findUuid(identity: IdentityInterface, meta: IdentityMetaInterface): Promise<string> {
    /*
     * 1. Select uuid from the exact phone number
     * 2. Select uuid from the phone_trunc and operator_user_id
     * 3. Select uuid from the phone_trunc and travel_pass_user_id
     * 4. Select uuid from uuid_generate_v4
     * 5. From previous select, take the newest result
     */
    const query = {
      text: `
        (
          SELECT created_at as datetime, uuid FROM ${this.table}
          WHERE phone IS NOT NULL and phone = $1::varchar
          AND created_at >= (NOW() - '30 days'::interval)::timestamp
          ORDER BY created_at DESC LIMIT 1
        ) UNION
        (
          SELECT ci.created_at as datetime, ci.uuid FROM ${this.table} as ci
          JOIN carpool.carpools AS cp ON cp.identity_id = ci._id
          WHERE ci.phone_trunc IS NOT NULL AND ci.phone_trunc = $2::varchar
          AND cp.operator_id = $3::int AND ci.operator_user_id = $4::varchar
          AND ci.created_at >= (NOW() - '30 days'::interval)::timestamp
          ORDER BY ci.created_at DESC LIMIT 1
        ) UNION
        (
          SELECT created_at as datetime, uuid FROM ${this.table}
          WHERE phone_trunc IS NOT NULL AND phone_trunc = $2::varchar
          AND travel_pass_name = $5::varchar AND travel_pass_user_id = $6::varchar
          AND created_at >= (NOW() - '30 days'::interval)::timestamp
          ORDER BY created_at DESC LIMIT 1
        ) UNION
        (
          SELECT to_timestamp(0)::timestamp as datetime, uuid_generate_v4() as uuid
        )
        ORDER BY datetime DESC
        LIMIT 1
        `,
      values: [
        identity.phone,
        identity.phone_trunc,
        meta.operator_id,
        identity.operator_user_id,
        identity.travel_pass_name,
        identity.travel_pass_user_id,
      ],
    };

    const result = await this.connection.getClient().query(query);

    if (result.rowCount !== 1) {
      throw new Error('Cant find uuid for this person');
    }

    return result.rows[0].uuid;
  }
}
