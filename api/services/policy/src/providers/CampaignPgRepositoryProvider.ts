import { provider, NotFoundException } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';

import {
  CampaignInterface,
  CampaignRepositoryProviderInterface,
  CampaignRepositoryProviderInterfaceResolver,
} from '../interfaces';

@provider({
  identifier: CampaignRepositoryProviderInterfaceResolver,
})
export class CampaignPgRepositoryProvider implements CampaignRepositoryProviderInterface {
  public readonly table = 'policy.policies';

  constructor(protected connection: PostgresConnection) {}

  async find(id: number, territoryId?: number): Promise<CampaignInterface> {
    const values = [id];
    if (!!territoryId) {
      values.push(territoryId);
    }
    const query = {
      text: `
        SELECT * FROM ${this.table}
        WHERE _id = $1
        AND deleted_at IS NULL
        ${!!territoryId ? 'AND territory_id = $2' : ''}
        LIMIT 1
      `,
      values: [id],
    };

    const result = await this.connection.getClient().query(query);

    if (result.rowCount === 0) {
      return undefined;
    }

    return result.rows[0];
  }

  async create(data: CampaignInterface): Promise<CampaignInterface> {
    const query = {
      text: `
        INSERT INTO ${this.table} (
          territory_id,
          start_date,
          end_date,
          name,
          status,
          uses
        ) VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6
        )
        RETURNING *
      `,
      values: [data.territory_id, data.start_date, data.end_date, data.name, data.status, data.uses],
    };

    const result = await this.connection.getClient().query(query);
    if (result.rowCount !== 1) {
      throw new Error(`Unable to create campaign (${JSON.stringify(data)})`);
    }

    return result.rows[0];
  }

  async patch(id: number, _patch: Partial<CampaignInterface>): Promise<CampaignInterface> {
    // const updatablefields = ['name', 'start_date', 'end_date', 'status', 'uses'].filter(
    //   (k) => Object.keys(patch).indexOf(k) >= 0,
    // );

    const sets = {
      text: ['updated_at = NOW()'],
      values: [],
    };

    const query = {
      text: `
      UPDATE ${this.table}
        SET ${sets.text.join(',')}
        WHERE _id = $#
        AND deleted_at IS NULL
        RETURNING *
      `,
      values: [...sets.values, id],
    };

    query.text = query.text.split('$#').reduce((acc, current, idx, origin) => {
      if (idx === origin.length - 1) {
        return `${acc}${current}`;
      }

      return `${acc}${current}$${idx + 1}`;
    }, '');

    const result = await this.connection.getClient().query(query);
    if (result.rowCount !== 1) {
      throw new NotFoundException(`campaign not found (${id})`);
    }

    return result.rows[0];
  }

  async delete(id: number): Promise<void> {
    const query = {
      text: `
      UPDATE ${this.table}
        SET deleted_at = NOW()
        WHERE _id = $1 AND deleted_at IS NULL
      `,
      values: [id],
    };

    const result = await this.connection.getClient().query(query);

    if (result.rowCount !== 1) {
      throw new NotFoundException(`Campaign not found (${id})`);
    }

    return;
  }

  async findWhere(search: {
    _id?: number;
    territory_id?: number | null | number[];
    status?: string;
    datetime?: Date;
    ends_in_the_future?: boolean;
  }): Promise<CampaignInterface[]> {
    const values = [];
    const whereClauses = ['deleted_at IS NULL'];
    for (const key of Reflect.ownKeys(search)) {
      switch (key) {
        case '_id':
          values.push(search[key]);
          whereClauses.push(`_id = $${values.length}`);
          break;
        case 'status':
          values.push(search[key]);
          whereClauses.push(`status::text = $${values.length}`);
          break;
        case 'territory_id':
          const tid = search[key];
          if (tid === null) {
            whereClauses.push('territory_id IS NULL');
          } else if (Array.isArray(tid)) {
            values.push(tid);
            whereClauses.push(`territory_id = ANY($${values.length}::int[])`);
          } else {
            values.push(tid);
            whereClauses.push(`territory_id = $${values.length}::int`);
          }
          break;
        case 'datetime':
          values.push(search[key]);
          whereClauses.push(`start_date <= $${values.length}::timestamp AND end_date >= $${values.length}::timestamp`);
          break;
        case 'ends_in_the_future':
          whereClauses.push(`end_date ${search[key] ? '>' : '<'} NOW()`);
          break;
        default:
          break;
      }
    }
    const query = {
      values,
      text: `
        SELECT * FROM ${this.table}
        WHERE ${whereClauses.join(' AND ')}
      `,
    };

    const result = await this.connection.getClient().query(query);

    if (result.rowCount === 0) {
      return [];
    }

    return result.rows;
  }
}
