import { PoolClient, PostgresConnection } from '/ilos/connection-postgres/index.ts';
import { provider } from '/ilos/common/index.ts';

import { MetadataRepositoryProviderInterfaceResolver, SerializedStoredMetadataInterface } from '../interfaces/index.ts';

@provider({
  identifier: MetadataRepositoryProviderInterfaceResolver,
})
export class MetadataRepositoryProvider implements MetadataRepositoryProviderInterfaceResolver {
  public readonly table = 'policy.policy_metas';

  constructor(protected connection: PostgresConnection) {}

  protected async getSingle(
    client: PoolClient,
    policyId: number,
    key: string,
    datetime?: Date,
  ): Promise<SerializedStoredMetadataInterface> {
    const res = await client.query<any>({
      text: `
        SELECT datetime, policy_id, key, value FROM ${this.table}
        WHERE policy_id = $1 AND key = $2 ${datetime ? 'AND datetime <= $3' : ''}
        ORDER BY datetime DESC, updated_at DESC
        LIMIT 1
      `,
      values: [policyId, key, ...(datetime ? [datetime] : [])],
    });
    return res.rows[0];
  }

  async get(policyId: number, keys: string[], datetime?: Date): Promise<SerializedStoredMetadataInterface[]> {
    const connection = await this.connection.getClient().connect();
    try {
      const result = [];
      for (const key of keys) {
        const r = await this.getSingle(connection, policyId, key, datetime);
        if (r) {
          result.push(r);
        }
      }
      return result;
    } finally {
      connection.release();
    }
  }

  async set(data: SerializedStoredMetadataInterface[]): Promise<void> {
    const values: [Array<number>, Array<string>, Array<number>, Array<Date>] = data.reduce(
      ([policyIds, keys, values, dates], i) => {
        policyIds.push(i.policy_id);
        keys.push(i.key);
        values.push(i.value);
        dates.push(i.datetime);
        return [policyIds, keys, values, dates];
      },
      [[], [], [], []],
    );

    const query = {
      text: `
        INSERT INTO ${this.table} (policy_id, key, value, datetime)
          SELECT * FROM UNNEST($1::int[], $2::varchar[], $3::int[], $4::timestamp[])
      `,
      values,
    };

    await this.connection.getClient().query<any>(query);
    return;
  }

  async delete(policyId: number, from?: Date): Promise<void> {
    const query = {
      text: `
        DELETE FROM ${this.table}
          WHERE policy_id = $1::int
          ${from ? 'AND datetime >= $2::timestamp' : ''}
      `,
      values: [policyId, ...(from ? [from] : [])],
    };

    await this.connection.getClient().query<any>(query);
    return;
  }
}
