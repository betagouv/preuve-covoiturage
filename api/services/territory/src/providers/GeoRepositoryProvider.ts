import { KernelInterfaceResolver, provider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';
import { FindBySiretRawResultInterface } from '../interfaces/FindBySiretRawResultInterface';
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
import { SingleResultInterface as GeoSingleResultInterface } from '../shared/territory/listGeo.contract';

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
    const results = await this.connection.getClient().query<FindBySiretRawResultInterface>({
      values: [params.siren, new Date().getFullYear() - 1],
      text: `
        SELECT l_aom, aom, epci, l_epci, com, l_com
        FROM GEO.perimeters
        WHERE (aom = $1::varchar OR epci = $1::varchar) 
          AND YEAR = $2::int
      `,
    });

    if (!results.rows[0]) {
      return { aom_name: null, aom_siren: null, epci_name: null, epci_siren: null, coms: [] };
    }

    return {
      aom_name: results.rows[0].l_aom,
      aom_siren: results.rows[0].aom,
      epci_name: results.rows[0].l_epci,
      epci_siren: results.rows[0].epci,
      coms: <Array<GeoSingleResultInterface>>results.rows.map((g) => ({
        insee: g.com,
        name: g.l_com,
      })),
    };
  }
}
