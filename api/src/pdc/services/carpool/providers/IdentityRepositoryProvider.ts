import { NotFoundException, provider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';
import {
  findUuidOptions,
  IdentityMetaInterface,
  IdentityRepositoryProviderInterface,
  IdentityRepositoryProviderInterfaceResolver,
} from '../interfaces/IdentityRepositoryProviderInterface';
import { IdentityInterface } from '@shared/common/interfaces/IdentityInterface';

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
    const results = await this.connection.getClient().query<any>({
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
          identity_key,
          uuid
        ) VALUES ( $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12 )
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
        identity.identity_key,
        await this.findUuid(identity, meta, { generate: true, interval: 30 }),
      ],
    });

    if (!results.rowCount) {
      throw new Error('Failed to insert identity');
    }

    return results.rows[0];
  }

  public async delete(_id: number): Promise<void> {
    const results = await this.connection.getClient().query<any>({
      text: `DELETE FROM ${this.table} WHERE _id = $1`,
      values: [_id],
    });

    if (!results.rowCount) {
      throw new Error('Failed to delete identity');
    }

    return;
  }

  public async findUuid(
    identity: IdentityInterface,
    meta: IdentityMetaInterface,
    options?: findUuidOptions,
  ): Promise<string> {
    const opts: findUuidOptions = { generate: false, interval: 0, ...options };

    const query = {
      text: `
        -- search by complete phone number
        (
          SELECT created_at as datetime, uuid FROM ${this.table}
          WHERE phone IS NOT NULL and phone = $1::varchar
          ${opts.interval > 0 ? `AND created_at >= (NOW() - '${opts.interval} days'::interval)::timestamp` : ''}
          ORDER BY created_at DESC LIMIT 1
        ) UNION

        ${
          // select the right query depending on params to avoid running useless queries
          identity.phone_trunc
            ? `
          -- search by phone_trunc + operator_user_id + operator_id
          (
            SELECT ci.created_at as datetime, ci.uuid FROM ${this.table} as ci
            JOIN carpool.carpools AS cp ON cp.identity_id = ci._id
            WHERE ci.phone_trunc IS NOT NULL AND ci.phone_trunc = $2::varchar
            AND cp.operator_id = $3::int AND ci.operator_user_id = $4::varchar
            ${opts.interval > 0 ? `AND ci.created_at >= (NOW() - '${opts.interval} days'::interval)::timestamp` : ''}
            ORDER BY ci.created_at DESC LIMIT 1
          ) UNION
        `
            : `
          -- search by operator_user_id and operator_id
          (
            SELECT ci.created_at as datetime, ci.uuid FROM ${this.table} as ci
            JOIN carpool.carpools AS cp ON cp.identity_id = ci._id
            WHERE ci.operator_user_id IS NOT NULL AND ci.operator_user_id = $4::varchar
            AND cp.operator_id = $3::int
            ${opts.interval > 0 ? `AND ci.created_at >= (NOW() - '${opts.interval} days'::interval)::timestamp` : ''}
            ORDER BY ci.created_at DESC LIMIT 1
          ) UNION
        `
        }

        -- search by travel_pass name
        (
          SELECT created_at as datetime, uuid FROM ${this.table}
          WHERE phone_trunc IS NOT NULL AND phone_trunc = $2::varchar
          AND travel_pass_name = $5::varchar AND travel_pass_user_id = $6::varchar
          ${opts.interval > 0 ? `AND created_at >= (NOW() - '${opts.interval} days'::interval)::timestamp` : ''}
          ORDER BY created_at DESC LIMIT 1
        )

        -- generate a new UUID
        ${opts.generate ? ' UNION (SELECT to_timestamp(0)::timestamp as datetime, uuid_generate_v4() as uuid )' : ''}
        ORDER BY datetime DESC

        -- keep the most recent result only
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

    const result = await this.connection.getClient().query<{ datetime: Date; uuid: string }>(query);

    if (!result.rowCount) {
      throw new NotFoundException('Cannot find UUID for this person');
    }

    return result.rows[0].uuid;
  }

  /**
   * Return a list of UUID from search criteria.
   * Similar to findUUID but returns a list of all UUID instead of limiting to 1 result.
   * Does not generate a UUID
   */
  public async findIdentities(
    identity: IdentityInterface,
    meta: IdentityMetaInterface,
  ): Promise<{ _id: number; uuid: string }[]> {
    const opts: Pick<findUuidOptions, 'interval'> = { interval: 0 };

    const query = {
      text: `
        WITH list AS (
          -- search by complete phone number
          (
            SELECT _id, uuid, created_at FROM ${this.table}
            WHERE phone IS NOT NULL and phone = $1::varchar
            ${opts.interval > 0 ? `AND created_at >= (NOW() - '${opts.interval} days'::interval)::timestamp` : ''}
            ORDER BY created_at DESC
          ) UNION

          ${
            // select the right query depending on params to avoid running useless queries
            identity.phone_trunc
              ? `
            -- search by phone_trunc + operator_user_id + operator_id
            (
              SELECT ci._id, uuid, ci.created_at FROM ${this.table} as ci
              JOIN carpool.carpools AS cp ON cp.identity_id = ci._id
              WHERE ci.phone_trunc IS NOT NULL AND ci.phone_trunc = $2::varchar
              AND cp.operator_id = $3::int AND ci.operator_user_id = $4::varchar
              ${opts.interval > 0 ? `AND ci.created_at >= (NOW() - '${opts.interval} days'::interval)::timestamp` : ''}
              ORDER BY ci.created_at DESC
            ) UNION
          `
              : `
            -- search by operator_user_id and operator_id
            (
              SELECT ci._id, uuid, ci.created_at FROM ${this.table} as ci
              JOIN carpool.carpools AS cp ON cp.identity_id = ci._id
              WHERE ci.operator_user_id IS NOT NULL AND ci.operator_user_id = $4::varchar
              AND cp.operator_id = $3::int
              ${opts.interval > 0 ? `AND ci.created_at >= (NOW() - '${opts.interval} days'::interval)::timestamp` : ''}
              ORDER BY ci.created_at DESC
            ) UNION
          `
          }

          -- search by travel_pass name
          (
            SELECT _id, uuid, created_at FROM ${this.table}
            WHERE phone_trunc IS NOT NULL AND phone_trunc = $2::varchar
            AND travel_pass_name = $5::varchar AND travel_pass_user_id = $6::varchar
            ${opts.interval > 0 ? `AND created_at >= (NOW() - '${opts.interval} days'::interval)::timestamp` : ''}
            ORDER BY created_at DESC
          )
        )
        SELECT _id, uuid FROM list GROUP BY _id, uuid
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

    const result = await this.connection.getClient().query<{ _id: number; uuid: string }>(query);

    if (!result.rowCount) {
      throw new NotFoundException('Cannot find identity for this person');
    }

    return result.rows;
  }
}
