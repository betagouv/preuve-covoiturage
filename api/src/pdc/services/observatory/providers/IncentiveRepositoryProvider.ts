import { provider } from "@/ilos/common/index.ts";
import { PostgresConnection } from "@/ilos/connection-postgres/index.ts";
import { getTableName } from "@/pdc/services/observatory/helpers/tableName.ts";
import {
  IncentiveParamsInterface,
  IncentiveRepositoryInterface,
  IncentiveRepositoryInterfaceResolver,
  IncentiveResultInterface,
} from "@/pdc/services/observatory/interfaces/IncentiveRepositoryProviderInterface.ts";

@provider({
  identifier: IncentiveRepositoryInterfaceResolver,
})
export class IncentiveRepositoryProvider
  implements IncentiveRepositoryInterface {
  private readonly table = (
    params:
      | IncentiveParamsInterface
      | IncentiveParamsInterface,
  ) => {
    return getTableName(params, "observatoire_stats", "incentive");
  };
  constructor(private pg: PostgresConnection) {}

  async getIncentive(
    params: IncentiveParamsInterface,
  ): Promise<IncentiveResultInterface> {
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
    if (params.direction) {
      queryValues.push(params.direction);
      conditions.push(`direction = $4`);
    }
    if (params.month) {
      queryValues.push(params.month);
      params.direction
        ? conditions.push(`month = $5`)
        : conditions.push(`month = $4`);
    }
    if (params.trimester) {
      queryValues.push(params.trimester);
      params.direction
        ? conditions.push(`trimester = $5`)
        : conditions.push(`trimester = $4`);
    }
    if (params.semester) {
      queryValues.push(params.semester);
      params.direction
        ? conditions.push(`semester = $5`)
        : conditions.push(`semester = $4`);
    }

    const queryText = `
      SELECT 
        code, 
        libelle,
        direction,
        collectivite,
        operateur,
        autres 
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
