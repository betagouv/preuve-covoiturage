import { provider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';
import {
  FluxRepositoryInterface,
  FluxRepositoryInterfaceResolver,
  InsertFluxParamsInterface,
  InsertFluxResultInterface,
  MonthlyFluxParamsInterface,
  MonthlyFluxResultInterface,
} from '../interfaces/FluxRepositoryProviderInterface';
import { InsertTypeEnum } from '../shared/observatory/insertFlux.contract';

@provider({
  identifier: FluxRepositoryInterfaceResolver,
})
export class FluxRepositoryProvider implements FluxRepositoryInterface {
  private readonly table = 'observatory.monthly_flux';
  private readonly perim_table = 'geo.perimeters';
  private readonly insert_procedure = 'observatory.insert_monthly_flux';

  constructor(private pg: PostgresConnection) {}

  async insertFlux(params: InsertFluxParamsInterface): Promise<InsertFluxResultInterface> {
    const today = new Date();
    const start = new Date('2020-01-01').getTime();
    let current = start;
    const end = new Date(today.setMonth(today.getMonth()-1)).getTime();
    if(params.type == InsertTypeEnum.ALL){
      while(current <= end){
        const sql = `CALL procedure ${this.insert_procedure}(${new Date(current).getFullYear()},${new Date(current).getMonth()})`;
        await this.pg.getClient().query(sql);
        const date = new Date(current);
        current = new Date(date.setMonth(date.getMonth()+1)).getTime();
      }
    } else if(params.type == InsertTypeEnum.LAST){
      const sql = `CALL procedure ${this.insert_procedure}(${new Date(end).getFullYear()},${new Date(end).getMonth()})`;
      await this.pg.getClient().query(sql);
    }
  };
  
  async monthlyFlux(params: MonthlyFluxParamsInterface): Promise<MonthlyFluxResultInterface> {
    const sql = `SELECT 
      l_territory_1 as ter_1, lng_1, lat_1,
      l_territory_2 as ter_2, lng_2, lat_2,
      passengers, distance, duration 
    FROM ${this.table}
    WHERE year = ${params.year}
    AND month = ${params.month}
    AND type = '${params.t}'
    ${params.code ? 
      `AND (territory_1 IN (
        SELECT ${params.t} FROM (SELECT com,epci,aom,dep,reg,country FROM ${this.perim_table} WHERE year = ${params.year}) t 
        WHERE ${params.t2} = '${params.code}'
      ) OR territory_2 IN (
        SELECT ${params.t} FROM (SELECT com,epci,aom,dep,reg,country FROM ${this.perim_table} WHERE year = ${params.year}) t 
        WHERE ${params.t2} = '${params.code}'
      ))`
      : ''
    } 
    AND territory_1 <> territory_2;`;

    const response: { rowCount: number; rows: MonthlyFluxResultInterface } = await this.pg.getClient().query(sql);
    return response.rows;
  };
}
