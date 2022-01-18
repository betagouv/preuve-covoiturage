import { PostgresConnection } from '@ilos/connection-postgres';
import { provider } from '@ilos/common';

import {
  MetadataWrapperInterface,
  MetadataRepositoryProviderInterface,
  MetadataRepositoryProviderInterfaceResolver,
} from '../interfaces';
import { MetadataWrapper } from './MetadataWrapper';

@provider({
  identifier: MetadataRepositoryProviderInterfaceResolver,
})
export class MetadataRepositoryProvider implements MetadataRepositoryProviderInterface {
  public readonly table = 'policy.policy_metas';

  constructor(protected connection: PostgresConnection) {}

  async get(id: number, askedKeys: string[] = [], datetime?: Date): Promise<MetadataWrapperInterface> {
    const connection = await this.connection.getClient().connect();
    try {
      const clauses: {
        wheres: string[];
        values: any[];
      } = {
        wheres: ['policy_id = $1'],
        values: [id],
      };
      
      if (datetime) {
        clauses.wheres.push('datetime <= $2::timestamp');
        clauses.values.push(datetime);
      }
      const keys: string[] = [...askedKeys];
      if (!keys || !keys.length) {
        const result = await connection.query({
          text: `
            SELECT distinct key FROM ${this.table}
            WHERE ${clauses.wheres.join(' AND ')}
          `,
          values: clauses.values, 
        });
        keys.push(...result.rows.map(r => r.key));
      }

      const result = [];
      const queryText = `
        SELECT key, value FROM ${this.table}
        WHERE ${[...clauses.wheres, `key = $${datetime ? '3' : '2'}::varchar`].join(' AND ')}
        ORDER BY datetime DESC
        LIMIT 1
      `;
      for (const key of keys) {
        const r = await connection.query({
          rowMode: 'array',
          text: queryText,
          values: [...clauses.values, key],
        });
        if(r.rows.length) {
          result.push(r.rows[0]);
        }
      }
      return new MetadataWrapper(id, result);
    } finally {
      connection.release();
    }
  }

  async set(policyId: number, metadata: MetadataWrapperInterface, date: Date): Promise<void> {
    const keys = metadata.keys();
    const values = metadata.values();
    const policyIds = new Array(keys.length).fill(policyId);
    const dates = new Array(keys.length).fill(date);
    const query = {
      text: `
        INSERT INTO ${this.table} (policy_id, key, value, datetime)
          SELECT * FROM UNNEST($1::int[], $2::varchar[], $3::int[], $4::timestamp[])
      `,
      values: [policyIds, keys, values, dates],
    };

    await this.connection.getClient().query(query);
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

    await this.connection.getClient().query(query);
    return;
  }
}
