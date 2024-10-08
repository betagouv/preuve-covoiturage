import { provider } from "@/ilos/common/index.ts";
import { PostgresConnection } from "@/ilos/connection-postgres/index.ts";
import { getTableName } from "@/pdc/services/observatory/helpers/tableName.ts";
import {
  DistributionRepositoryInterface,
  DistributionRepositoryInterfaceResolver,
  JourneysByDistancesParamsInterface,
  JourneysByDistancesResultInterface,
  JourneysByHoursParamsInterface,
  JourneysByHoursResultInterface,
} from "@/pdc/services/observatory/interfaces/DistributionRepositoryProviderInterface.ts";

@provider({
  identifier: DistributionRepositoryInterfaceResolver,
})
export class DistributionRepositoryProvider
  implements DistributionRepositoryInterface {
  private readonly table = (
    params:
      | JourneysByHoursParamsInterface
      | JourneysByDistancesParamsInterface,
  ) => {
    return getTableName(params, "observatoire_stats", "distribution");
  };

  constructor(private pg: PostgresConnection) {}

  async getJourneysByHours(
    params: JourneysByHoursParamsInterface,
  ): Promise<JourneysByHoursResultInterface> {
    const tableName = this.table(params);
    const conditions = [
      `year = $1`,
      `type = $2`,
      `code = $3`,
    ];
    const queryValues = [
      params.year,
      params.type,
      params.code,
    ];
    if (params.month) {
      queryValues.push(params.month);
      conditions.push(`month = $4`);
    }
    if (params.trimester) {
      queryValues.push(params.trimester);
      conditions.push(`trimester = $4`);
    }
    if (params.semester) {
      queryValues.push(params.semester);
      conditions.push(`semester = $4`);
    }
    const queryText = `
      SELECT 
        code, 
        libelle,
        direction,
        hours 
      FROM ${tableName}
      WHERE ${conditions.join(" AND ")}
    `;
    const response = await this.pg.getClient().query({
      text: queryText,
      values: queryValues,
    });
    return response.rows;
  }

  async getJourneysByDistances(
    params: JourneysByDistancesParamsInterface,
  ): Promise<JourneysByDistancesResultInterface> {
    const tableName = this.table(params);
    const conditions = [
      `year = $1`,
      `type = $2`,
      `code = $3`,
      `direction = $4`,
    ];
    const queryValues = [
      params.year,
      params.type,
      params.code,
      params.direction,
    ];
    if (params.month) {
      queryValues.push(params.month);
      conditions.push(`month = $5`);
    }
    if (params.trimester) {
      queryValues.push(params.trimester);
      conditions.push(`trimester = $5`);
    }
    if (params.semester) {
      queryValues.push(params.semester);
      conditions.push(`semester = $5`);
    }
    const queryText = `
      SELECT 
        code, 
        libelle,
        direction,
        distances 
      FROM ${tableName}
      WHERE ${conditions.join(" AND ")}
    `;
    const response = await this.pg.getClient().query({
      text: queryText,
      values: queryValues,
    });
    return response.rows;
  }
}
