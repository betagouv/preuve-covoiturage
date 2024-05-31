import { provider } from '@ilos/common/index.ts';
import { PostgresConnection } from '@ilos/connection-postgres/index.ts';
import {
  DeleteMonthlyDistributionParamsInterface,
  DistributionRepositoryInterface,
  DistributionRepositoryInterfaceResolver,
  InsertMonthlyDistributionParamsInterface,
  JourneysByDistancesParamsInterface,
  JourneysByDistancesResultInterface,
  JourneysByHoursParamsInterface,
  JourneysByHoursResultInterface,
} from '../interfaces/DistributionRepositoryProviderInterface.ts';

@provider({
  identifier: DistributionRepositoryInterfaceResolver,
})
export class DistributionRepositoryProvider implements DistributionRepositoryInterface {
  private readonly table = 'observatory.monthly_distribution';
  private readonly insert_procedure = 'observatory.insert_monthly_distribution';

  constructor(private pg: PostgresConnection) {}

  async insertOneMonthDistribution(params: InsertMonthlyDistributionParamsInterface): Promise<void> {
    await this.pg.getClient().query<any>({
      values: [params.year, params.month],
      text: `
        CALL ${this.insert_procedure}($1, $2);
      `,
    });
  }

  async deleteOneMonthDistribution(params: DeleteMonthlyDistributionParamsInterface): Promise<void> {
    await this.pg.getClient().query<any>({
      values: [params.year, params.month],
      text: `
        DELETE FROM ${this.table} WHERE year = $1 AND month = $2;
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
    const response: { rowCount: number; rows: JourneysByHoursResultInterface } = await this.pg
      .getClient()
      .query<any>(sql);
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
      .query<any>(sql);
    return response.rows;
  }
}
