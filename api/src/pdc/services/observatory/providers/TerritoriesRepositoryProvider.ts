import { provider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';

import {
  TerritoriesRepositoryInterface,
  TerritoriesRepositoryInterfaceResolver,
  TerritoriesListParamsInterface,
  TerritoriesListResultInterface,
  TerritoryNameParamsInterface,
  TerritoryNameResultInterface,
} from '../interfaces/TerritoriesRepositoryProviderInterface';

@provider({
  identifier: TerritoriesRepositoryInterfaceResolver,
})
export class TerritoriesRepositoryProvider implements TerritoriesRepositoryInterface {
  private readonly table = 'geo.perimeters_centroid';

  constructor(private pg: PostgresConnection) {}

  async getTerritoriesList(params: TerritoriesListParamsInterface): Promise<TerritoriesListResultInterface> {
    const sql = {
      values: [params.year],
      text: `
        SELECT territory, l_territory, type
        FROM ${this.table}
        WHERE year = geo.get_latest_millesime_or($1::smallint)
        ORDER BY type,territory;
      `,
    };
    const response: { rowCount: number; rows: TerritoriesListResultInterface } = await this.pg
      .getClient()
      .query<any>(sql);
    return response.rows;
  }

  async getTerritoryName(params: TerritoryNameParamsInterface): Promise<TerritoryNameResultInterface> {
    const sql = {
      values: [params.year, params.code, params.type],
      text: `
        SELECT distinct territory, l_territory, type
        FROM ${this.table}
        WHERE year = geo.get_latest_millesime_or($1::smallint)
        AND territory = $2
        AND type = $3
        ORDER BY type,territory;
      `,
    };
    const response = await this.pg.getClient().query<any>(sql);
    return response.rows[0];
  }
}
