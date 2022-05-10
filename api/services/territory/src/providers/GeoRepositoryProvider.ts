import { KernelInterfaceResolver, provider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';
import {
  GeoRepositoryProviderInterface,
  GeoRepositoryProviderInterfaceResolver,
  ListGeoParamsInterface,
  ListGeoResultInterface,
} from '../interfaces/GeoRepositoryProviderInterface';
import { GeoCodeTypeEnum } from '../shared/territory/common/geo';
import {
  ParamsInterface as FindBySirenParamsInterface,
  ResultInterface as FindBySirenResultInterface,
} from '../shared/territory/findGeoBySiren.contract';

@provider({
  identifier: GeoRepositoryProviderInterfaceResolver,
})
export class GeoRepositoryProvider implements GeoRepositoryProviderInterface {
  public readonly table = 'geo.perimeters';
  public readonly relationTable = 'territory.territory_group_selector';
  public readonly getMillesimeFunction = 'geo.get_latest_millesime';

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
        geoLevel = 'arr';
        break;
    }
    const label = `l_${geoLevel.toString()}`;

    if (search) {
      where.push(`LOWER(gp.${label}) LIKE $${where.length + 1}`);
      values.push(`%${search.toLowerCase().trim()}%`);
    }

    // dataset millesime
    const yearRes = await this.connection.getClient().query(`SELECT * from ${this.getMillesimeFunction}() as year`);
    const year = yearRes.rows[0]?.year;
    where.push(`year = $${where.length + 1}`);
    values.push(year);

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

  async findBySiren(params: FindBySirenParamsInterface): Promise<FindBySirenResultInterface> {
    return null;
  }
}
