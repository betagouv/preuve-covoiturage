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
  public readonly table = 'geo.perimeters';
  public readonly relationTable = 'territory.territory_group_selector';

  constructor(protected connection: PostgresConnection, protected kernel: KernelInterfaceResolver) {}

  async list(params: ListGeoParamsInterface): Promise<ListGeoResultInterface> {
    const { search, type, where: whereParams, limit, offset } = { limit: 100, offset: 0, ...params };

    const where = [];
    const values = [];

    if (whereParams && whereParams._id && whereParams._id.length) {
      where.push(`gp.id = ANY($${where.length + 1})`);
      values.push(whereParams._id);
    }

    let geoLevel = '';

    switch (type) {
      case GeoCodeTypeEnum.Region:
        geoLevel = 'reg';
        break;

      case GeoCodeTypeEnum.District:
        geoLevel = 'dep';
        break;

      case GeoCodeTypeEnum.City:
      default:
        geoLevel = 'com';
        break;
    }
    const label = `l_${geoLevel.toString()}`;

    if (search) {
      where.push(`LOWER(gp.${label}) LIKE $${where.length + 1}`);
      values.push(`%${search.toLowerCase().trim()}%`);
    }

    // dataset millesime
    where.push(`year = $${where.length + 1}`);
    values.push(new Date().getFullYear());

    const totalResult = await this.connection.getClient().query<{ count: string }>({
      values,
      text: `
        SELECT count(*) FROM ${this.table} AS gp
        WHERE ${where.join(' AND ')}
      `,
    });

    const total = parseFloat(totalResult.rows[0].count || '0');

    values.push(limit);
    values.push(offset);

    const results = await this.connection.getClient().query({
      values,
      text: `
        SELECT
          gp.id as _id,
          gp.${label} as name,
          ${geoLevel} as insee
          FROM ${this.table} as gp
        WHERE ${where.join(' AND ')}
        ORDER BY gp.${label} ASC
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
        WITH data AS (
          SELECT
            arr,
            com,
            epci,
            dep,
            reg,
            country,
            aom,
            reseau
          FROM ${this.table}
          WHERE
            com = $1
          ORDER BY year DESC
          LIMIT 1
        )
        SELECT
          tg.name,
          tgs.territory_id
        FROM ${this.relationTable} AS tgs
        JOIN data AS d
          ON (d.arr = tgs.selector_value AND tgs.selector_type = 'com')
          OR (d.com = tgs.selector_value AND tgs.selector_type = 'com')
          OR (d.reg = tgs.selector_value AND tgs.selector_type = 'region')
        JOIN territory.territory_group AS tg
          ON tgs.territory_group_id = tg._id
      `,
      values: [params.insees],
    };
    const result = await client.query(query);

    return result.rows as FindByInseeResultInterface;
  }
}
