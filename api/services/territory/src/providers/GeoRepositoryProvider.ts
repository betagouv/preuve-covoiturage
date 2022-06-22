import { KernelInterfaceResolver, provider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';
import { FindBySiretRawResultInterface } from '../interfaces/FindBySiretRawResultInterface';
import {
  GeoRepositoryProviderInterface,
  GeoRepositoryProviderInterfaceResolver,
  ListGeoParamsInterface,
  ListGeoResultInterface,
} from '../interfaces/GeoRepositoryProviderInterface';
import { TerritoryCodeEnum } from '../shared/territory/common/interfaces/TerritoryCodeInterface';
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
    const { search, where: whereParams, limit, offset } = { limit: 100, offset: 0, ...params };

    const where = [];
    const values = [];

    // search
    where.push(`lower(l_com) like $1`);
    values.push(`%${search.toLowerCase().trim()}%`); // $1

    // year
    const yearRes = await this.connection.getClient().query(`SELECT * from ${this.getMillesimeFunction}() as year`);
    const year = yearRes.rows[0]?.year;
    where.push(`year = $${where.length + 1}`);
    values.push(year); // $2

    // insees constraints
    if (whereParams && whereParams.insee && whereParams.insee.length) {
      where.push(`arr = ANY($${where.length + 1})`);
      values.push(whereParams.insee); //$3
    }

    const totalResult = await this.connection.getClient().query<{ count: string }>({
      values,
      text: `
      WITH search as (
        SELECT aom, l_aom, epci, l_epci, l_com, com, l_reg, reg, l_dep, dep from ${this.table}
         where (l_aom like $1
         or lower(l_com) like $1
         or lower(l_epci) like $1
         or lower(l_reg) like $1
         or lower(l_dep) like $1) and year = $2 ${
           whereParams && whereParams.insee && whereParams.insee.length ? 'and arr = ANY($3)' : ''
         } ORDER BY YEAR DESC)
     SELECT count(*) FROM 
     (SELECT distinct l_aom as name, aom as insee, '${
       TerritoryCodeEnum.Mobility
     }' as type from search where lower(l_aom) like $1
      UNION
      SELECT distinct l_epci as name, epci as insee, '${
        TerritoryCodeEnum.CityGroup
      }' as type from search where lower(l_epci) like $1
      UNION
      SELECT distinct l_reg as name, reg as insee, '${
        TerritoryCodeEnum.Region
      }' as type from search where lower(l_reg) like $1
      UNION
      SELECT distinct l_com as name, com as insee, '${
        TerritoryCodeEnum.City
      }' as type from search where lower(l_com) like $1
      UNION
      SELECT distinct l_dep as name, dep as insee, '${
        TerritoryCodeEnum.District
      }' as type from search where lower(l_dep) like $1) x
      `,
    });

    const total = parseFloat(totalResult.rows[0].count || '0');

    values.push(limit); // $4
    values.push(offset); // $5

    const results = await this.connection.getClient().query({
      values,
      text: `
      WITH search as (
        SELECT aom, l_aom, epci, l_epci, l_com, com, l_reg, reg, l_dep, dep from geo.perimeters 
         where (l_aom like $1
         or lower(l_com) like $1
         or lower(l_epci) like $1
         or lower(l_reg) like $1
         or lower(l_dep) like $1) and year = $2 ${
           whereParams && whereParams.insee && whereParams.insee.length ? 'and arr = ANY($3)' : ''
         } ORDER BY YEAR DESC)
     SELECT distinct l_aom as name, aom as insee, '${
       TerritoryCodeEnum.Mobility
     }' as type from search where lower(l_aom) like $1
     UNION
     SELECT distinct l_epci as name, epci as insee, '${
       TerritoryCodeEnum.CityGroup
     }' as type from search where lower(l_epci) like $1
     UNION
     SELECT distinct l_reg as name, reg as insee, '${
       TerritoryCodeEnum.Region
     }' as type from search where lower(l_reg) like $1
     UNION
     SELECT distinct l_com as name, com as insee, '${
       TerritoryCodeEnum.City
     }' as type from search where lower(l_com) like $1
     UNION
     SELECT distinct l_dep as name, dep as insee, '${
       TerritoryCodeEnum.District
     }' as type from search where lower(l_dep) like $1
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

  async findBySiren(params: FindBySirenParamsInterface): Promise<FindBySirenResultInterface> {
    const yearRes = await this.connection.getClient().query(`SELECT * from ${this.getMillesimeFunction}() as year`);
    const year = yearRes.rows[0]?.year;

    const results = await this.connection.getClient().query<FindBySiretRawResultInterface>({
      values: [params.siren, year],
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
