import { PostgresConnection } from '@ilos/connection-postgres';
import { ConfigInterfaceResolver, provider, NotFoundException } from '@ilos/common';

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

  async get(id: number, key: string | null = 'default'): Promise<MetadataWrapper> {
    const result = await this.connection.getClient().query({
      text: `
        SELECT
          value
        FROM ${this.table}
        WHERE
          policy_id = $1 AND
          key = $2
        LIMIT 1`,
      values: [id, key],
    });

    const data = result.rowCount === 1 ? result.rows[0].value : undefined;
    return new MetadataWrapper(id, key, data);
  }

  async set(metadata: MetadataWrapper): Promise<void> {
    const [id, masterKey] = metadata.signature;

    const query = {
      text: `
        INSERT INTO ${this.table} (policy_id, key, value)
          VALUES ($1, $2, $3)
          ON CONFLICT (policy_id, key)
          DO UPDATE SET
            value = $3 
      `,
      values: [id, masterKey, metadata.all()],
    };

    await this.connection.getClient().query(query);
    return;
  }
}
