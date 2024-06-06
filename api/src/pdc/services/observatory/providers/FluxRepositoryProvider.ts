import { provider } from '/ilos/common/index.ts';
import { PostgresConnection } from '/ilos/connection-postgres/index.ts';
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
} from '../interfaces/FluxRepositoryProviderInterface.ts';
import { checkTerritoryParam, checkIndicParam } from '../helpers/checkParams.ts';

@provider({
  identifier: FluxRepositoryInterfaceResolver,
})
export class FluxRepositoryProvider implements FluxRepositoryInterface {
  private readonly table = 'observatory.monthly_flux';
  private readonly perim_table = 'geo.perimeters';
  private readonly insert_procedure = 'observatory.insert_monthly_flux';

  constructor(private pg: PostgresConnection) {}

  async insertOneMonthFlux(params: InsertMonthlyFluxParamsInterface): Promise<void> {
    await this.pg.getClient().query<any>({
      values: [params.year, params.month],
      text: `
        CALL ${this.insert_procedure}($1, $2);
      `,
    });
  }

  async deleteOneMonthFlux(params: DeleteMonthlyFluxParamsInterface): Promise<void> {
    await this.pg.getClient().query<any>({
      values: [params.year, params.month],
      text: `
        DELETE FROM ${this.table} WHERE year = $1 AND month = $2;
      `,
    });
  }
  // Retourne les données de la table observatory.monthly_flux pour le mois et l'année
  // et le type de territoire en paramètres
  // Paramètres optionnels observe et code pour filtrer les résultats sur un territoire
  async getMonthlyFlux(params: MonthlyFluxParamsInterface): Promise<MonthlyFluxResultInterface> {
    const sql = {
      values: [params.year, params.month, params.code],
      text: `SELECT 
        l_territory_1 as ter_1, lng_1, lat_1,
        l_territory_2 as ter_2, lng_2, lat_2,
        passengers, distance, duration 
      FROM ${this.table}
      WHERE year = $1
      AND month = $2
      AND type = '${checkTerritoryParam(params.observe)}'::observatory.monthly_flux_type_enum
      AND (distance/journeys) <= 80
      ${
        params.code
          ? `AND (territory_1 IN (
          SELECT ${checkTerritoryParam(params.observe)} FROM (SELECT com,epci,aom,dep,reg,country FROM ${
            this.perim_table
          } WHERE year = geo.get_latest_millesime_or( $1::smallint)) t 
          WHERE ${checkTerritoryParam(params.type)} = $3
        ) OR territory_2 IN (
          SELECT ${checkTerritoryParam(params.observe)} FROM (SELECT com,epci,aom,dep,reg,country FROM ${
            this.perim_table
          } WHERE year = geo.get_latest_millesime_or( $1::smallint)) t 
          WHERE ${checkTerritoryParam(params.type)} = $3
        ))`
          : ''
      } 
      AND territory_1 <> territory_2;`,
    };
    const response: { rowCount: number; rows: MonthlyFluxResultInterface } = await this.pg.getClient().query<any>(sql);
    return response.rows;
  }

  // Retourne l'année et le mois du dernier enregistrement de la table observatory.monthly_flux
  async lastRecordMonthlyFlux(): Promise<lastRecordMonthlyFluxResultInterface> {
    const sql = `SELECT distinct year, month 
      FROM ${this.table} 
      WHERE type ='com' 
      ORDER BY year DESC,month DESC
      LIMIT 1;
    `;
    const response = await this.pg.getClient().query<any>(sql);
    return response.rows[0];
  }

  // Retourne les données pour les graphiques construits à partir de la table observatory.monthly_flux
  async getEvolMonthlyFlux(params: EvolMonthlyFluxParamsInterface): Promise<EvolMonthlyFluxResultInterface> {
    const checkArray = ['journeys', 'passengers', 'has_incentive', 'distance', 'duration'];
    const indic = checkIndicParam(params.indic, checkArray, 'journeys');
    const start = Number(params.year + String(params.month).padStart(2, '0'));
    const limit = params.past ? Number(params.past) * 12 + 1 : 25;
    const sql = {
      values: [checkTerritoryParam(params.type), params.code, limit],
      text: `
        SELECT year, month, sum(${indic}) AS ${indic} 
        ${indic == 'distance' ? ', sum(journeys) AS journeys' : ''}
        FROM ${this.table}
        WHERE concat(year::varchar,TO_CHAR(month, 'fm00'))::integer <= ${start}
        AND type = $1::observatory.monthly_flux_type_enum
        AND (territory_1 = $2 OR territory_2 = $2)
        GROUP BY year, month
        ORDER BY (year,month) DESC
        LIMIT $3;
      `,
    };
    const response: { rowCount: number; rows: EvolMonthlyFluxResultInterface } = await this.pg
      .getClient()
      .query<any>(sql);
    return response.rows;
  }

  // Retourne les données pour le top 10 des trajets dans le dashboard
  async getBestMonthlyFlux(params: BestMonthlyFluxParamsInterface): Promise<BestMonthlyFluxResultInterface> {
    const sql = {
      values: [params.year, params.month, params.code, params.limit],
      text: `
        SELECT territory_1, l_territory_1, territory_2, l_territory_2, journeys
        FROM ${this.table}
        WHERE year = $1
        AND month = $2
        AND (territory_1 IN (
            SELECT com FROM (SELECT com,epci,aom,dep,reg,country FROM ${
              this.perim_table
            } WHERE year = geo.get_latest_millesime_or( $1::smallint)) t 
            WHERE ${checkTerritoryParam(params.type)} = $3) 
          OR territory_2 IN (
            SELECT com FROM (SELECT com,epci,aom,dep,reg,country FROM ${
              this.perim_table
            } WHERE year = geo.get_latest_millesime_or( $1::smallint)) t 
            WHERE ${checkTerritoryParam(params.type)} = $3)
        ) 
        ORDER BY journeys DESC
        LIMIT $4;
      `,
    };
    const response: { rowCount: number; rows: BestMonthlyFluxResultInterface } = await this.pg
      .getClient()
      .query<any>(sql);
    return response.rows;
  }
}
