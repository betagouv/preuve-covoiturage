import { provider, KernelInterfaceResolver } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';

import {
  ParamsInterface as FindByInseeParamsInterface,
  ResultInterface as FindByInseeResultInterface,
} from '../shared/territory/findGeoByCode.contract';
import {
  ListGeoParamsInterface,
  ListGeoResultInterface,
  GeoRepositoryProviderInterfaceResolver,
  GeoRepositoryProviderInterface,
} from '../interfaces/GeoRepositoryProviderInterface';

@provider({
  identifier: GeoRepositoryProviderInterfaceResolver,
})
export class GeoRepositoryProvider implements GeoRepositoryProviderInterface {
  public readonly table = 'territory.territories';
  public readonly relationTable = 'territory.territory_relation';

  constructor(protected connection: PostgresConnection, protected kernel: KernelInterfaceResolver) {}

  async list(params: ListGeoParamsInterface): Promise<ListGeoResultInterface> {
    const { search, where: whereParams, limit, offset } = { limit: 100, offset: 0, ...params };

    const where = [];
    const values = [];

    if (whereParams && whereParams._id && whereParams._id.length) {
      where.push(`_id = ANY($${where.length + 1})`);
      values.push(whereParams._id);
    }

    if (search) {
      where.push(`LOWER(name) LIKE $${where.length + 1}`);
      values.push(`%${search.toLowerCase().trim()}%`);
    }

    const totalResult = await this.connection.getClient().query<{ count: string }>({
      values,
      text: `
        SELECT count(*) FROM ${this.table}
        ${where.length ? ` WHERE ${where.join(' AND ')}` : ''}
      `,
    });

    const total = parseFloat(totalResult.rows[0].count || '0');

    // always add the limit
    values.push(limit);
    values.push(offset);

    const results = await this.connection.getClient().query({
      values,
      text: `
        SELECT _id, name FROM ${this.table}
        ${where.length ? ` WHERE ${where.join(' AND ')}` : ''}
        ORDER BY name ASC
        LIMIT $${where.length + 1}
        OFFSET $${where.length + 2}
      `,
    });

    return {
      data: results.rows,
      meta: {
        pagination: {
          offset,
          limit,
          total,
        },
      },
    };
  }

  async findByCodes(params: FindByInseeParamsInterface): Promise<FindByInseeResultInterface> {
    const client = this.connection.getClient();
    const query = {
      text: `
        SELECT
          tt.name, 
          tc.territory_id
        FROM territory.territory_codes AS tc
        JOIN ${this.table} AS tt
          ON tc.territory_id = tt._id
        WHERE 
          tc.type = 'insee' AND 
          tc.value = ANY($1) 
        GROUP BY tc.territory_id, tt.name
      `,
      values: [params.insees],
    };
    const result = await client.query(query);

    return result.rows as FindByInseeResultInterface;
  }
}
