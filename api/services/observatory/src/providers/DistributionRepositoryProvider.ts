import { provider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';
import {
  DistributionRepositoryInterface,
  DistributionRepositoryInterfaceResolver,
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
  private readonly startDate = new Date('2020-01-01');

  constructor(private pg: PostgresConnection) {}

  get today() {
    return new Date();
  }

  get endDate() {
    return new Date(this.today.setMonth(this.today.getMonth() - 1));
  }

  async refreshAllDistribution(): Promise<void> {
    let currentDate = this.startDate;
    await this.pg.getClient().query(`TRUNCATE ${this.table};`);

    while (currentDate <= this.endDate) {
      await this.pg.getClient().query({
        values: [new Date(currentDate).getFullYear(), new Date(currentDate).getMonth() + 1],
        text: `
          CALL ${this.insert_procedure}($1, $2);
        `,
      });
      currentDate = new Date(currentDate.setMonth(currentDate.getMonth() + 1));
    }
  }

  async insertLastMonthDistribution(): Promise<void> {
    await this.pg.getClient().query({
      values: [new Date(this.endDate).getFullYear(), new Date(this.endDate).getMonth() + 1],
      text: `
        CALL ${this.insert_procedure}($1, $2);
      `,
    });
  }

  async getJourneysByHours(params: JourneysByHoursParamsInterface): Promise<JourneysByHoursResultInterface> {
    const filterDirection = params.direction
      ? `AND direction = '${params.direction}'::observatory.monthly_distribution_direction_enum`
      : '';
    const sql = {
      values: [params.year, params.month, params.type, params.code],
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
      ${filterDirection};`,
    };
    const response: { rowCount: number; rows: JourneysByHoursResultInterface } = await this.pg.getClient().query(sql);
    return response.rows;
  }

  async getJourneysByDistances(
    params: JourneysByDistancesParamsInterface,
  ): Promise<JourneysByDistancesResultInterface> {
    const filterDirection = params.direction
      ? `AND direction = '${params.direction}'::observatory.monthly_distribution_direction_enum`
      : '';
    const sql = {
      values: [params.year, params.month, params.type, params.code],
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
      ${filterDirection};`,
    };
    const response: { rowCount: number; rows: JourneysByDistancesResultInterface } = await this.pg
      .getClient()
      .query(sql);
    return response.rows;
  }
}
