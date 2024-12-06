import { provider } from "@/ilos/common/index.ts";
import { PostgresConnection } from "@/ilos/connection-postgres/index.ts";
import {
  OperatorsByMonthParamsInterface,
  OperatorsByMonthResultInterface,
  OperatorsRepositoryInterface,
  OperatorsRepositoryInterfaceResolver,
} from "@/pdc/services/dashboard/interfaces/OperatorsRepositoryProviderInterface.ts";

@provider({
  identifier: OperatorsRepositoryInterfaceResolver,
})
export class OperatorsRepositoryProvider implements OperatorsRepositoryInterface {
  private readonly table = "dashboard_stats.operators_by_month";

  constructor(private pg: PostgresConnection) {}

  async getOperatorsByMonth(
    params: OperatorsByMonthParamsInterface,
  ): Promise<OperatorsByMonthResultInterface> {
    const queryValues: (string | number)[] = [
      params.territory_id,
    ];
    const conditions = [
      "territory_id = $1",
    ];

    if (params.direction) {
      queryValues.push(params.direction);
      conditions.push(`direction = $2`);
    } else {
      conditions.push(`direction='both'`);
    }
    if (params.year) {
      queryValues.push(params.year);
      conditions.push(`year = ${params.direction ? "$3" : "$2"}`);
    }

    const queryText = `
      SELECT 
        year,
        month,
        territory_id,
        direction,
        operator_id,
        operator_name,
        journeys,
        incented_journeys,
        incentive_amount
      FROM ${this.table}
      WHERE ${conditions.join(" AND ")}
    `;
    const response = await this.pg.getClient().query({
      text: queryText,
      values: queryValues,
    });
    return response.rows;
  }
}
