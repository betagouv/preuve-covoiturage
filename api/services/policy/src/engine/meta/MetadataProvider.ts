import { PostgresConnection } from '@ilos/connection-postgres';
import { provider } from '@ilos/common';

import {
  MetadataProviderInterface,
  MetadataProviderInterfaceResolver,
} from '../interfaces/MetadataProviderInterface';
import { MetadataWrapper } from './MetadataWrapper';
import { MetaInterface } from '../interfaces';

@provider({
  identifier: MetadataProviderInterfaceResolver,
})
export class MetadataProvider implements MetadataProviderInterface {
  public readonly table = 'policy.policy_metas';

  constructor(protected connection: PostgresConnection) {}

  async get(id: number, keys: string[] = ['default']): Promise<MetaInterface> {
    const result = await this.connection.getClient().query({
      text: `
        SELECT
          value
        FROM ${this.table}
        WHERE
          policy_id = $1 AND
          key = ANY($2::varchar[])`,
      values: [id, keys],
    });

    return new MetadataWrapper(id, result.rows);
  }

  async set(policyId: number, metadata: MetaInterface): Promise<void> {
    const keys = metadata.keys();
    const values = metadata.values();
    const policyIds = new Array(keys.length).map(_ => policyId);
    const query = {
      text: `
        INSERT INTO ${this.table} (policy_id, key, value)
          SELECT * FROM UNNEST($1::int[], $2::varchar[], $3::json[])
        ON CONFLICT (policy_id, key)
        DO UPDATE SET
          value = excluded.value
      `,
      values: [
        policyIds,
        keys,
        values
      ],
    };

    await this.connection.getClient().query(query);
    return;
  }
}
