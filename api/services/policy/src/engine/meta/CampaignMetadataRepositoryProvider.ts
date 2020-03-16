import { PostgresConnection } from '@ilos/connection-postgres';
import { provider } from '@ilos/common';

import {
  CampaignMetadataRepositoryProviderInterface,
  CampaignMetadataRepositoryProviderInterfaceResolver,
} from '../interfaces/CampaignMetadataRepositoryProviderInterface';
import { MetadataWrapper } from './MetadataWrapper';

@provider({
  identifier: CampaignMetadataRepositoryProviderInterfaceResolver,
})
export class CampaignMetadataRepositoryProvider implements CampaignMetadataRepositoryProviderInterface {
  public readonly table = 'policy.policy_metas';

  constructor(protected connection: PostgresConnection) {}

  async get(id: number, keys: string[] = ['default']): Promise<MetadataWrapper> {
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

  async set(metadata: MetadataWrapper): Promise<void> {
    const keys = metadata.keys();
    const values = metadata.values();
    const policyId = new Array(keys.length).map(_ => metadata.policy_id);
    const query = {
      text: `
        INSERT INTO ${this.table} (policy_id, key, value)
          SELECT * FROM UNNEST($1::int[], $2::varchar[], $3::json[])
        ON CONFLICT (policy_id, key)
        DO UPDATE SET
          value = excluded.value
      `,
      values: [
        policyId,
        keys,
        values
      ],
    };

    await this.connection.getClient().query(query);
    return;
  }
}
