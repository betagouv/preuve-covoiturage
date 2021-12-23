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
import { GeoCodeTypeEnum } from '../shared/territory/common/geo';

@provider({
  identifier: GeoRepositoryProviderInterfaceResolver,
})
export class GeoRepositoryProvider implements GeoRepositoryProviderInterface {
  public readonly table = 'territory.territories';
  public readonly relationTable = 'territory.territory_relation';

  constructor(protected connection: PostgresConnection, protected kernel: KernelInterfaceResolver) {}

  async list(params: ListGeoParamsInterface): Promise<ListGeoResultInterface> {
    const { search, type, where: whereParams, limit, offset } = { limit: 100, offset: 0, ...params };

    const where = [];
    const values = [];

    if (whereParams && whereParams._id && whereParams._id.length) {
      where.push(`tt._id = ANY($${where.length + 1})`);
      values.push(whereParams._id);
    }

    if (type) {
      // Ugly workaround to make new interface work with old territories model
      const actualTerritoryType: string = type === GeoCodeTypeEnum.City ? 'town' : type;
      where.push(`tt.level = $${where.length + 1}`);
      values.push(`${actualTerritoryType}`);
    }

    if (search) {
      where.push(`LOWER(tt.name) LIKE $${where.length + 1}`);
      values.push(`%${search.toLowerCase().trim()}%`);
    }

    const totalResult = await this.connection.getClient().query<{ count: string }>({
      values,
      text: `
        SELECT count(*) FROM ${
          this.table
        } as tt LEFT OUTER JOIN territory.territory_codes as tc ON tt._id = tc.territory_id
        WHERE (tc.type = 'insee' OR tc.type = 'codedep' OR tc.type IS NULL) AND ${where.join(' AND ')}
      `,
    });

    const total = parseFloat(totalResult.rows[0].count || '0');

    values.push(limit);
    values.push(offset);

    const results = await this.connection.getClient().query({
      values,
      text: `
        SELECT tt._id as _id, tt.name as name, tc.value as insee FROM ${
          this.table
        } as tt LEFT OUTER JOIN territory.territory_codes as tc ON tt._id = tc.territory_id
        WHERE (tc.type = 'insee' OR tc.type = 'codedep' OR tc.type IS NULL) AND ${where.join(' AND ')}
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
