import { provider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';
import {
  OneCampaignParamsInterface,
  OneCampaignResultInterface,
  AllCampaignsParamsInterface,
  AllCampaignsResultInterface,
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


  async getOneCampaign(params: OneCampaignParamsInterface): Promise<OneCampaignResultInterface> {
    const sql = {
      values: [params.code, checkTerritoryParam(params.type)],
      text: `SELECT *
      FROM ${this.table}
      WHERE left(code,9) = $1
      AND type = $2
      `
    };
    const response: { rows: OneCampaignResultInterface } = await this.pg.getClient().query<any>(sql);
    return response.rows;
  }

  async getAllCampaigns(params: AllCampaignsParamsInterface): Promise<AllCampaignsResultInterface> {
    const type = params.type !== undefined ? checkTerritoryParam(params.type) : null ;
    const year = params.year !== undefined ? params.year : new Date().getFullYear();
    const sql = {
      values: [year],
      text: `SELECT a.*, ST_AsGeoJSON(b.geom,6)::json as geom
      FROM ${this.table} a 
      LEFT JOIN ${this.perim_table} b on a.type = b.type AND left(a.code,9) = b.territory 
      AND b.year = geo.get_latest_millesime_or($1)
      WHERE ${type ? `a.type = '${type}' AND` : ''}
      b.geom IS NOT NULL
      ${
        params.year
          ? `AND (right(a.date_debut,4) = $1::varchar AND right(a.date_fin,4) = $1::varchar)`
          : `AND to_date(a.date_fin,'DD/MM/YYYY') > now()`
      }
      ;`,
    };
    const response: { rows: AllCampaignsResultInterface } = await this.pg.getClient().query<any>(sql);
    return response.rows;
  }
}
