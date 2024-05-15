import { provider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';
import {
  CampaignsParamsInterface,
  CampaignsResultInterface,
  IncentiveCampaignsRepositoryInterfaceResolver,
  IncentiveCampaignsRepositoryInterface
} from '../interfaces/IncentiveCampaignsRepositoryProviderInterface';
import { checkTerritoryParam } from '../helpers/checkParams';

@provider({
  identifier: IncentiveCampaignsRepositoryInterfaceResolver,
})
export class IncentiveCampaignsRepositoryProvider implements IncentiveCampaignsRepositoryInterface {
  private readonly table = 'observatory.incentive_campaigns';
  private readonly perim_table = 'observatory.perimeters_aggregate';

  constructor(private pg: PostgresConnection) {}

  async getCampaigns(params: CampaignsParamsInterface): Promise<CampaignsResultInterface> {
    const type = params.type !== undefined ? checkTerritoryParam(params.type) : null ;
    const year = params.year !== undefined ? Number(params.year) : new Date().getFullYear();
    const sql = {
      values: params.code !== undefined ? [year, params.code] : [year],
      text: `SELECT a.*, ST_AsGeoJSON(b.geom,6)::json as geom
      FROM ${this.table} a 
      LEFT JOIN ${this.perim_table} b on a.type = b.type AND left(a.code,9) = b.territory 
      AND b.year = geo.get_latest_millesime_or($1)
      WHERE 
      ${params.code !== undefined ? `left(a.code,9) = $2 AND` : ''}
      ${type ? `a.type = '${type}' AND` : ''}
      b.geom IS NOT NULL
      ${
        params.year !== undefined
          ? `AND (right(a.date_debut,4) = $1::varchar AND right(a.date_fin,4) = $1::varchar)`
          : `${params.code !== undefined ? `` : `AND to_date(a.date_fin,'DD/MM/YYYY') > now()`}`
      }
      ;`,
    };
    const response: { rows: CampaignsResultInterface } = await this.pg.getClient().query<any>(sql);
    return response.rows;
  }
}
