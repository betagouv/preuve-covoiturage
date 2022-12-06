import { provider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';
import {
  OccupationRepositoryInterface,
  OccupationRepositoryInterfaceResolver,
  InsertLastMonthOccupationParamsInterface,
  InsertLastMonthOccupationResultInterface,
  refreshAllOccupationParamsInterface,
  refreshAllOccupationResultInterface,
  MonthlyOccupationParamsInterface,
  MonthlyOccupationResultInterface,
} from '../interfaces/OccupationRepositoryProviderInterface';
@provider({
  identifier: OccupationRepositoryInterfaceResolver,
})
export class OccupationRepositoryProvider implements OccupationRepositoryInterface {
  private readonly table = 'observatory.monthly_occupation';
  private readonly perim_table = 'geo.perimeters';
  private readonly insert_procedure = 'observatory.insert_monthly_occupation';
  private readonly today = new Date();
  private readonly startTime = new Date('2020-01-01').getTime();
  private readonly endTime = new Date(this.today.setMonth(this.today.getMonth()-1)).getTime();

  constructor(private pg: PostgresConnection) {}

  async refreshAllOccupation(params: refreshAllOccupationParamsInterface): Promise<refreshAllOccupationResultInterface> {
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

  async insertLastMonthOccupation(params: InsertLastMonthOccupationParamsInterface): Promise<InsertLastMonthOccupationResultInterface> {
    await this.pg.getClient().query({
      values: [new Date(this.endTime).getFullYear(), new Date(this.endTime).getMonth()+1],
      text: `
        CALL ${this.insert_procedure}($1, $2);
      `,
    });
  };
  // Retourne les données de la table observatory.monthly_flux pour le mois et l'année et le type de territoire en paramètres
  // Paramètres optionnels t2 et code pour filtrer les résultats sur un territoire
  async monthlyOccupation(params: MonthlyOccupationParamsInterface): Promise<MonthlyOccupationResultInterface> {
    const territoryTypes = ['com','epci','aom','dep','reg','country']
    const checkTerritoryType = (territory:string) => {
      return territoryTypes.find( d => d == territory) || 'com';
    };

    const sql = {
      values:[params.year, params.month, params.t, params.code],  
      text: `SELECT year, month, type,
      territory, l_territory, journeys, trips,
      has_incentive, occupation_rate, geom
      FROM ${this.table}
      WHERE year = $1
      AND month = $2
      AND type = $3::observatory.monthly_occupation_type_enum
      ${params.code ? 
        `AND territory IN (
          SELECT ${checkTerritoryType(params.t)} FROM (SELECT com,epci,aom,dep,reg,country FROM ${this.perim_table} WHERE year = $1) t 
          WHERE ${checkTerritoryType(params.t2)} = $4
        )`
        : ''
      };`
    };
    const response: { rowCount: number, rows: MonthlyOccupationResultInterface } = await this.pg.getClient().query(sql);
    return response.rows;
  };
}