import { provider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';
import {
  OccupationRepositoryInterface,
  OccupationRepositoryInterfaceResolver,
  MonthlyOccupationParamsInterface,
  MonthlyOccupationResultInterface,
  EvolMonthlyOccupationParamsInterface,
  EvolMonthlyOccupationResultInterface,
  BestMonthlyTerritoriesParamsInterface,
  BestMonthlyTerritoriesResultInterface,
  InsertMonthlyOccupationParamsInterface,
  DeleteMonthlyOccupationParamsInterface,
} from '../interfaces/OccupationRepositoryProviderInterface';
import { checkTerritoryParam, checkIndicParam } from '../helpers/checkParams';

@provider({
  identifier: OccupationRepositoryInterfaceResolver,
})
export class OccupationRepositoryProvider implements OccupationRepositoryInterface {
  private readonly table = 'observatory.monthly_occupation';
  private readonly perim_table = 'geo.perimeters';
  private readonly insert_procedure = 'observatory.insert_monthly_occupation';

  constructor(private pg: PostgresConnection) {}

  async insertOneMonthOccupation(params: InsertMonthlyOccupationParamsInterface): Promise<void> {
    await this.pg.getClient().query({
      values: [params.year, params.month],
      text: `
        CALL ${this.insert_procedure}($1, $2);
      `,
    });
  }

  async deleteOneMonthOccupation(params: DeleteMonthlyOccupationParamsInterface): Promise<void> {
    await this.pg.getClient().query({
      values: [params.year, params.month],
      text: `
        DELETE FROM ${this.table} WHERE year = $1 AND month = $2;
      `,
    });
  }
  // Retourne les données alimentant la carte de flux à partir de la table observatory.monthly_occupation
  // pour le mois et l'année et le type de territoire en paramètres
  // Paramètres optionnels t2 et code pour filtrer les résultats sur un territoire
  async getMonthlyOccupation(params: MonthlyOccupationParamsInterface): Promise<MonthlyOccupationResultInterface> {
    const sql = {
      values: [params.year, params.month, params.code],
      text: `SELECT year, month, type,
      territory, l_territory, journeys, trips,
      occupation_rate, geom
      FROM ${this.table}
      WHERE year = $1
      AND month = $2
      AND type = '${checkTerritoryParam(params.observe)}'::observatory.monthly_occupation_type_enum
      ${
        params.code
          ? `AND territory IN (
          SELECT ${checkTerritoryParam(params.observe)} FROM (SELECT com,epci,aom,dep,reg,country FROM ${
            this.perim_table
          } WHERE year = geo.get_latest_millesime_or( $1::smallint)) t 
          WHERE ${checkTerritoryParam(params.type)} = $3
        )`
          : ''
      };`,
    };
    const response: { rowCount: number; rows: MonthlyOccupationResultInterface } = await this.pg.getClient().query(sql);
    return response.rows;
  }

  // Retourne les données pour les graphiques construits à partir de la table observatory.monthly_occupation
  async getEvolMonthlyOccupation(
    params: EvolMonthlyOccupationParamsInterface,
  ): Promise<EvolMonthlyOccupationResultInterface> {
    const checkArray = ['journeys', 'trips', 'has_incentive', 'occupation_rate'];
    const start = Number(params.year + String(params.month).padStart(2, '0'));
    const limit = params.past ? Number(params.past) * 12 + 1 : 25;
    const sql = {
      values: [checkTerritoryParam(params.type), params.code, limit],
      text: `
        SELECT year, month, ${checkIndicParam(params.indic, checkArray, 'journeys')}
        FROM ${this.table}
        WHERE concat(year::varchar,TO_CHAR(month, 'fm00'))::integer <= ${start}
        AND type = $1::observatory.monthly_occupation_type_enum
        AND territory = $2
        ORDER BY (year,month) DESC
        LIMIT $3;
      `,
    };
    const response: { rowCount: number; rows: EvolMonthlyOccupationResultInterface } = await this.pg
      .getClient()
      .query(sql);
    return response.rows;
  }

  // Retourne les données pour le top 10 des territoires dans le dashboard
  async getBestMonthlyTerritories(
    params: BestMonthlyTerritoriesParamsInterface,
  ): Promise<BestMonthlyTerritoriesResultInterface> {
    const sql = {
      values: [params.year, params.month, params.observe, params.code, params.limit],
      text: `
        SELECT territory, l_territory, journeys
        FROM ${this.table}
        WHERE year = $1
        AND month = $2
        AND type = $3::observatory.monthly_occupation_type_enum
        AND territory IN (
          SELECT ${checkTerritoryParam(params.observe)} FROM (SELECT com,epci,aom,dep,reg,country FROM ${
            this.perim_table
          } WHERE year = geo.get_latest_millesime_or( $1::smallint)) t 
          WHERE ${checkTerritoryParam(params.type)} = $4
        ) 
        ORDER BY journeys DESC
        LIMIT $5;
      `,
    };
    const response: { rowCount: number; rows: BestMonthlyTerritoriesResultInterface } = await this.pg
      .getClient()
      .query(sql);
    return response.rows;
  }
}
