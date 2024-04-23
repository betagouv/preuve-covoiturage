import { provider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';
import {
  FluxRepositoryInterface,
  FluxRepositoryInterfaceResolver,
  MonthlyFluxParamsInterface,
  MonthlyFluxResultInterface,
  lastRecordMonthlyFluxResultInterface,
  EvolMonthlyFluxParamsInterface,
  EvolMonthlyFluxResultInterface,
  BestMonthlyFluxParamsInterface,
  BestMonthlyFluxResultInterface,
  InsertMonthlyFluxParamsInterface,
  DeleteMonthlyFluxParamsInterface,
} from '../interfaces/FluxRepositoryProviderInterface';
import { checkTerritoryParam, checkIndicParam } from '../helpers/checkParams';

@provider({
  identifier: IncentiveRepositoryInterfaceResolver,
})
export class IncentiveRepositoryProvider implements IncentiveRepositoryInterface {
  private readonly table = 'observatory.incentive_campaigns';
  private readonly perim_table = 'geo.perimeters';

  constructor(private pg: PostgresConnection) {}


  // Retourne les données de la table observatory.monthly_flux pour le mois et l'année
  // et le type de territoire en paramètres
  // Paramètres optionnels observe et code pour filtrer les résultats sur un territoire
  async getOneCampaign(params: OneCampaignParamsInterface): Promise<OneCampaignResultInterface> {
    const sql = {
      values: [params.year, params.type, params.code],
      text: `SELECT *
      FROM ${this.table}
      WHERE type = '${checkTerritoryParam(params.type)}'
      AND code = $3
      `
    };
    const response: { rows: OneCampaignResultInterface } = await this.pg.getClient().query<any>(sql);
    return response.rows;
  }

  async getAllCampaigns(params: AllCampaignsParamsInterface): Promise<AllCampaignsResultInterface> {
    const sql = {
      values: [params.year, params.type],
      text: `SELECT *
      FROM ${this.table} 
      WHERE type = '${checkTerritoryParam(params.type)}'
      ${
        params.year
          ? `AND (right(date_debut,4) = $1 AND right(date_fin,4) = $1)`
          : `AND to_date(date_fin,'DD/MM/YYYY') > now()`
      };`,
    };
    const response: { rows: AllCampaignsResultInterface } = await this.pg.getClient().query<any>(sql);
    return response.rows;
  }
}
