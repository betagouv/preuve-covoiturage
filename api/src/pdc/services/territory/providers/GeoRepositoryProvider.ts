import { KernelInterfaceResolver, provider } from '/ilos/common/index.ts';
import { PostgresConnection } from '/ilos/connection-postgres/index.ts';
import {
  ResultInterface as AllGeoResultInterface,
  SingleResultInterface as GeoResultInterface,
} from '/shared/territory/allGeo.contract.ts';
import { TerritoryCodeEnum } from '/shared/territory/common/interfaces/TerritoryCodeInterface.ts';
import {
  ParamsInterface as FindBySirenParamsInterface,
  ResultInterface as FindBySirenResultInterface,
} from '/shared/territory/findGeoBySiren.contract.ts';
import {
  ParamsInterface as ListGeoParamsInterface,
  ResultInterface as ListGeoResultInterface,
  SingleResultInterface as ListGeoSingleResultInterface,
} from '/shared/territory/listGeo.contract.ts';
import { FindBySiretRawResultInterface } from '../interfaces/FindBySiretRawResultInterface.ts';
import {
  GeoRepositoryProviderInterface,
  GeoRepositoryProviderInterfaceResolver,
} from '../interfaces/GeoRepositoryProviderInterface.ts';

@provider({
  identifier: GeoRepositoryProviderInterfaceResolver,
})
export class GeoRepositoryProvider implements GeoRepositoryProviderInterface {
  public readonly table = 'geo.perimeters';
  public readonly tableCentroid = 'geo.perimeters_centroid';
  public readonly relationTable = 'territory.territory_group_selector';
  public readonly getMillesimeFunction = 'geo.get_latest_millesime';

  constructor(
    protected connection: PostgresConnection,
    protected kernel: KernelInterfaceResolver,
  ) {}

  async getAllGeo(): Promise<AllGeoResultInterface> {
    const results = await this.connection.getClient().query<GeoResultInterface>(`
      SELECT concat(territory, '_', type) as id, territory, l_territory, type
      FROM ${this.tableCentroid}
      WHERE year = geo.get_latest_millesime()
      ORDER BY type, territory
    `);

    return results.rows;
  }

  async list(params: ListGeoParamsInterface): Promise<ListGeoResultInterface> {
    const { search, where: whereParams, exclude_coms, limit, offset } = { limit: 100, offset: 0, ...params };
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

    // INSEE codes constraints
    if (whereParams && whereParams.insee && whereParams.insee.length) {
      where.push(`arr = ANY($${where.length + 1})`);
      values.push(whereParams.insee); //$3
    }

    /* eslint-disable max-len,prettier/prettier */
    const totalResult = await this.connection.getClient().query<{ count: string }>({
      values,
      text: `
        WITH search AS (
          SELECT aom, l_aom, epci, l_epci, ${exclude_coms ? '' : 'l_com, com,'} l_reg, reg, l_dep, dep FROM ${this.table}
          WHERE
            (
              l_aom LIKE $1
              ${ exclude_coms ? '' : 'OR lower(l_com) LIKE $1' }
              OR lower(l_epci) LIKE $1
              OR lower(l_reg) LIKE $1
              OR lower(l_dep) LIKE $1
            )
            AND year = $2
            ${ whereParams && whereParams.insee && whereParams.insee.length ? 'AND arr = ANY($3)' : '' }
          ORDER BY YEAR DESC
        )
        SELECT count(*) FROM (
          SELECT DISTINCT l_aom AS name, aom AS insee, '${ TerritoryCodeEnum.Mobility }' AS type FROM search WHERE lower(l_aom) LIKE $1
          UNION
          SELECT DISTINCT l_epci AS name, epci AS insee, '${ TerritoryCodeEnum.CityGroup }' AS type FROM search WHERE lower(l_epci) LIKE $1
          UNION
          SELECT DISTINCT l_reg AS name, reg AS insee, '${ TerritoryCodeEnum.Region }' AS type FROM search WHERE lower(l_reg) LIKE $1
          ${ exclude_coms ? '' : `UNION SELECT DISTINCT l_com AS name, com AS insee, '${ TerritoryCodeEnum.City }' AS type FROM search WHERE lower(l_com) LIKE $1` }
          UNION
          SELECT DISTINCT l_dep AS name, dep AS insee, '${ TerritoryCodeEnum.District }' AS type FROM search WHERE lower(l_dep) LIKE $1
        ) AS x
      `,
    });

    const total = parseFloat(totalResult.rows[0].count || '0');

    values.push(limit); // $4
    values.push(offset); // $5

    const results = await this.connection.getClient().query({
      values,
      text: `
        WITH search AS (
          SELECT aom, l_aom, epci, l_epci, ${ exclude_coms ? '' : 'l_com, com,' } l_reg, reg, l_dep, dep FROM geo.perimeters 
          WHERE
            (
              l_aom LIKE $1
              ${ exclude_coms ? '' : 'OR lower(l_com) LIKE $1' }
              OR lower(l_epci) LIKE $1
              OR lower(l_reg) LIKE $1
              OR lower(l_dep) LIKE $1
            )
            AND year = $2
            ${ whereParams && whereParams.insee && whereParams.insee.length ? 'and arr = ANY($3)' : '' }
          ORDER BY YEAR DESC
        )
        SELECT DISTINCT l_aom AS name, aom AS insee, '${ TerritoryCodeEnum.Mobility }' AS type from search WHERE lower(l_aom) LIKE $1
        UNION
        SELECT DISTINCT l_epci AS name, epci AS insee, '${ TerritoryCodeEnum.CityGroup }' AS type from search WHERE lower(l_epci) LIKE $1
        UNION
        SELECT DISTINCT l_reg AS name, reg AS insee, '${ TerritoryCodeEnum.Region }' AS type from search WHERE lower(l_reg) LIKE $1
        ${ exclude_coms ? '' : `UNION SELECT DISTINCT l_com AS name, com AS insee, '${ TerritoryCodeEnum.City }' AS type from search WHERE lower(l_com) LIKE $1` }
        UNION
        SELECT DISTINCT l_dep AS name, dep AS insee, '${ TerritoryCodeEnum.District }' AS type from search WHERE lower(l_dep) LIKE $1
        ORDER BY name ASC
        LIMIT $${ where.length + 1 }
        OFFSET $${ where.length + 2 }
      `,
    });
    /* eslint-enable max-len,prettier/prettier */

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
        SELECT l_aom, aom, epci, l_epci, com, l_com, l_reg, reg, l_dep, dep
        FROM GEO.perimeters
        WHERE ${
          params.siren.length === 2 || params.siren.length === 3
            ? '(reg = $1::varchar OR dep = $1::varchar)'
            : '(aom = $1::varchar OR epci = $1::varchar)'
        } 
          AND YEAR = $2::int
      `,
    });

    if (!results.rows[0]) {
      return {
        reg_name: null,
        reg_siren: null,
        aom_name: null,
        dep_name: null,
        dep_siren: null,
        aom_siren: null,
        epci_name: null,
        epci_siren: null,
        coms: [],
      };
    }

    return {
      reg_name: results.rows[0].l_reg,
      reg_siren: results.rows[0].reg,
      aom_name: results.rows[0].l_aom,
      aom_siren: results.rows[0].aom,
      dep_name: results.rows[0].l_dep,
      dep_siren: results.rows[0].dep,
      epci_name: results.rows[0].l_epci,
      epci_siren: results.rows[0].epci,
      coms: results.rows.map<Pick<ListGeoSingleResultInterface, 'insee' | 'name'>>((g) => ({
        insee: g.com,
        name: g.l_com,
      })),
    };
  }
}
