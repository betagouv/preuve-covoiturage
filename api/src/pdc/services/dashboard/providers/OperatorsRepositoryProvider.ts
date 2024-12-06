import { provider } from "@/ilos/common/index.ts";
import { PostgresConnection } from "@/ilos/connection-postgres/index.ts";
import {
  OperatorsByDayParamsInterface,
  OperatorsByDayResultInterface,
  OperatorsByMonthParamsInterface,
  OperatorsByMonthResultInterface,
  OperatorsRepositoryInterface,
  OperatorsRepositoryInterfaceResolver,
} from "@/pdc/services/dashboard/interfaces/OperatorsRepositoryProviderInterface.ts";

@provider({
  identifier: OperatorsRepositoryInterfaceResolver,
})
export class OperatorsRepositoryProvider implements OperatorsRepositoryInterface {
  private readonly tableByMonth = "dashboard_stats.operators_by_month";
  private readonly tableByDay = "dashboard_stats.operators_by_day";

  constructor(private pg: PostgresConnection) {}

  async getOperatorsByDay(
    params: OperatorsByDayParamsInterface,
  ): Promise<OperatorsByDayResultInterface> {
    const queryValues: (string | number)[] = [
      params.territory_id,
    ];
    const conditions = [
      "territory_id = $1",
    ];
    //a débug
    const date = params.date ? new Date(params.date) : new Date();
    queryValues.push(date.toDateString());
    queryValues.push(new Date(date.setMonth(date.getMonth() - 2)).toDateString());
    conditions.push("start_date >= $2");
    conditions.push("start_date <= $3");

    if (params.direction) {
      queryValues.push(params.direction);
      conditions.push(`direction = $2`);
    } else {
      conditions.push(`direction='both'`);
    }

    const queryText = `
      SELECT 
        start_date,
        territory_id,
        direction,
        operator_id,
        operator_name,
        journeys::int,
        incented_journeys::int,
        incentive_amount::int
      FROM ${this.tableByDay}
      WHERE ${conditions.join(" AND ")}
    `;
    const response = await this.pg.getClient().query({
      text: queryText,
      values: queryValues,
    });
    return response.rows;
  }

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
        journeys::int,
        incented_journeys::int,
        incentive_amount::int
      FROM ${this.tableByMonth}
      WHERE ${conditions.join(" AND ")}
    `;
    const response = await this.pg.getClient().query({
      text: queryText,
      values: queryValues,
    });
    return response.rows;
  }
}
