import { provider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';
import {
  DistributionRepositoryInterface,
  DistributionRepositoryInterfaceResolver,
  InsertLastMonthDistributionParamsInterface,
  InsertLastMonthDistributionResultInterface,
  refreshAllDistributionParamsInterface,
  refreshAllDistributionResultInterface,
  JourneysByDistancesParamsInterface,
  JourneysByDistancesResultInterface,
  JourneysByHoursParamsInterface,
  JourneysByHoursResultInterface,
  
} from '../interfaces/DistributionRepositoryProviderInterface';

@provider({
  identifier: DistributionRepositoryInterfaceResolver,
})
export class DistributionRepositoryProvider implements DistributionRepositoryInterface {
  private readonly table = 'observatory.monthly_distribution';
  private readonly insert_procedure = 'observatory.insert_monthly_distribution';
  private readonly today = new Date();
  private readonly startTime = new Date('2020-01-01').getTime();
  private readonly endTime = new Date(this.today.setMonth(this.today.getMonth()-1)).getTime();

  constructor(private pg: PostgresConnection) {}
  
  async refreshAllDistribution(params: refreshAllDistributionParamsInterface): Promise<refreshAllDistributionResultInterface> {
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

  async insertLastMonthDistribution(params: InsertLastMonthDistributionParamsInterface): Promise<InsertLastMonthDistributionResultInterface> {
    await this.pg.getClient().query({
      values: [new Date(this.endTime).getFullYear(), new Date(this.endTime).getMonth()+1],
      text: `
        CALL ${this.insert_procedure}($1, $2);
      `,
    });
  };

  async getJourneysByHours(params: JourneysByHoursParamsInterface): Promise<JourneysByHoursResultInterface> {
    
    const filterDirection = params.direction ? `AND direction = '${params.direction}'::observatory.monthly_distribution_direction_enum` : '';
    const sql = {
      values:[params.year, params.month, params.t, params.code],  
      text: `SELECT
        territory, 
        l_territory,
        direction,
        hours 
      FROM ${this.table}
      WHERE year = $1
      AND month = $2
      AND type = $3::observatory.monthly_distribution_type_enum
      AND territory = $4
      ${filterDirection};`
    };
    const response: { rowCount: number, rows: JourneysByHoursResultInterface } = await this.pg.getClient().query(sql);
    return response.rows;
  };

  async getJourneysByDistances(params: JourneysByDistancesParamsInterface): Promise<JourneysByDistancesResultInterface> {
    const filterDirection = params.direction ? `AND direction = '${params.direction}'::observatory.monthly_distribution_direction_enum` : '';
    const sql = {
      values:[params.year, params.month, params.t, params.code],  
      text: `SELECT
        territory, 
        l_territory,
        direction,
        distances 
      FROM ${this.table}
      WHERE year = $1
      AND month = $2
      AND type = $3::observatory.monthly_distribution_type_enum
      AND territory = $4
      ${filterDirection};`
    };
    const response: { rowCount: number, rows: JourneysByDistancesResultInterface } = await this.pg.getClient().query(sql);
    return response.rows;
  };
}
