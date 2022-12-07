import { provider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';
import {
  FluxRepositoryInterface,
  FluxRepositoryInterfaceResolver,
  InsertLastMonthFluxParamsInterface,
  InsertLastMonthFluxResultInterface,
  refreshAllFluxParamsInterface,
  refreshAllFluxResultInterface,
  MonthlyFluxParamsInterface,
  MonthlyFluxResultInterface,
  lastRecordMonthlyFluxParamsInterface,
  lastRecordMonthlyFluxResultInterface,
  EvolMonthlyFluxParamsInterface,
  EvolMonthlyFluxResultInterface,
} from '../interfaces/FluxRepositoryProviderInterface';
import { checkTerritoryParam, checkIndicParam } from '../helpers/checkParams';

@provider({
  identifier: FluxRepositoryInterfaceResolver,
})
export class FluxRepositoryProvider implements FluxRepositoryInterface {
  private readonly table = 'observatory.monthly_flux';
  private readonly perim_table = 'geo.perimeters';
  private readonly insert_procedure = 'observatory.insert_monthly_flux';
  private readonly today = new Date();
  private readonly startTime = new Date('2020-01-01').getTime();
  private readonly endTime = new Date(this.today.setMonth(this.today.getMonth()-1)).getTime();

  constructor(private pg: PostgresConnection) {}

  async refreshAllFlux(params: refreshAllFluxParamsInterface): Promise<refreshAllFluxResultInterface> {
    let currentTime = this.startTime;
    await this.pg.getClient().query(`TRUNCATE ${this.table};`);

    while(currentTime <= this.endTime){
      await this.pg.getClient().query({
        values: [new Date(currentTime).getFullYear(), new Date(currentTime).getMonth()+1],
        text: `
          CALL ${this.insert_procedure}($1, $2);
        `,
      });
      const date = new Date(currentTime);
      currentTime = new Date(date.setMonth(date.getMonth()+1)).getTime();      
    };
  };

  async insertLastMonthFlux(params: InsertLastMonthFluxParamsInterface): Promise<InsertLastMonthFluxResultInterface> {
    await this.pg.getClient().query({
      values: [new Date(this.endTime).getFullYear(), new Date(this.endTime).getMonth()+1],
      text: `
        CALL ${this.insert_procedure}($1, $2);
      `,
    });
  };
  // Retourne les données de la table observatory.monthly_flux pour le mois et l'année et le type de territoire en paramètres
  // Paramètres optionnels t2 et code pour filtrer les résultats sur un territoire
  async getMonthlyFlux(params: MonthlyFluxParamsInterface): Promise<MonthlyFluxResultInterface> {
    const sql = {
      values:[params.year, params.month, params.t, params.code],  
      text: `SELECT 
        l_territory_1 as ter_1, lng_1, lat_1,
        l_territory_2 as ter_2, lng_2, lat_2,
        passengers, distance, duration 
      FROM ${this.table}
      WHERE year = $1
      AND month = $2
      AND type = $3::observatory.monthly_flux_type_enum
      ${params.code ? 
        `AND (territory_1 IN (
          SELECT ${checkTerritoryParam(params.t)} FROM (SELECT com,epci,aom,dep,reg,country FROM ${this.perim_table} WHERE year = $1) t 
          WHERE ${checkTerritoryParam(params.t2)} = $4
        ) OR territory_2 IN (
          SELECT ${checkTerritoryParam(params.t)} FROM (SELECT com,epci,aom,dep,reg,country FROM ${this.perim_table} WHERE year = $1) t 
          WHERE ${checkTerritoryParam(params.t2)} = $4
        ))`
        : ''
      } 
      AND territory_1 <> territory_2;`
    };
    const response: { rowCount: number, rows: MonthlyFluxResultInterface } = await this.pg.getClient().query(sql);
    return response.rows;
  };

  // Retourne l'année et le mois du dernier enregistrement de la table observatory.monthly_flux
  async lastRecordMonthlyFlux(params: lastRecordMonthlyFluxParamsInterface): Promise<lastRecordMonthlyFluxResultInterface> {
    const sql = `SELECT distinct year, month 
      FROM ${this.table} 
      WHERE type ='com' 
      ORDER BY year DESC,month DESC
      LIMIT 1;
    `
    const response = await this.pg.getClient().query(sql);
    return response.rows[0];
  }

  // Retourne les données pour les graphiques construits à partir de la table observatory.monthly_flux
  async getEvolMonthlyFlux(params: EvolMonthlyFluxParamsInterface): Promise<EvolMonthlyFluxResultInterface> {
    const checkArray = ['journeys','passengers','has_incentive','distance','duration'];
    const indic = checkIndicParam(params.indic, checkArray, 'journeys');
    const start = Number(params.year + String(params.month).padStart(2, '0'));
    const limit = params.past ? Number(params.past) * 12 + 1 : 25;
    const sql = {
      values:[checkTerritoryParam(params.t), params.code, limit],  
      text: `
        SELECT year, month, sum(${indic}) AS ${indic}
        FROM ${this.table}
        WHERE concat(year::varchar,TO_CHAR(month, 'fm00'))::integer <= ${start}
        AND type = $1::observatory.monthly_flux_type_enum
        AND (territory_1 = $2 OR territory_2 = $2)
        GROUP BY year, month
        ORDER BY (year,month) DESC
        LIMIT $3;
      `
    };
    const response: { rowCount: number, rows: EvolMonthlyFluxResultInterface } = await this.pg.getClient().query(sql);
    return response.rows;
  };
}
