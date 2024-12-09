import { provider } from "@/ilos/common/index.ts";
import { PostgresConnection } from "@/ilos/connection-postgres/index.ts";
import {
  IncentiveByDayParamsInterface,
  IncentiveByDayResultInterface,
  IncentiveByMonthParamsInterface,
  IncentiveByMonthResultInterface,
  IncentiveRepositoryInterface,
  IncentiveRepositoryInterfaceResolver,
} from "@/pdc/services/dashboard/interfaces/IncentiveRepositoryProviderInterface.ts";

@provider({
  identifier: IncentiveRepositoryInterfaceResolver,
})
export class IncentiveRepositoryProvider implements IncentiveRepositoryInterface {
  private readonly tableByMonth = "dashboard_stats.operators_by_month";
  private readonly tableByDay = "dashboard_stats.operators_by_day";

  constructor(private pg: PostgresConnection) {}

  async getIncentiveByDay(
    params: IncentiveByDayParamsInterface,
  ): Promise<IncentiveByDayResultInterface> {
    const queryValues: (string | number)[] = [
      params.territory_id,
    ];
    const conditions = [
      "territory_id = $1",
    ];
    const date = params.date ? new Date(params.date) : new Date();
    queryValues.push(date.toISOString().split("T")[0]);
    queryValues.push(new Date(date.setMonth(date.getMonth() - 2)).toISOString().split("T")[0]);
    conditions.push("start_date <= $2");
    conditions.push("start_date >= $3");

    if (params.direction) {
      queryValues.push(params.direction);
      conditions.push(`direction = $4`);
    } else {
      conditions.push(`direction='both'`);
    }

    const queryText = `
      SELECT 
        to_char(start_date, 'YYYY-MM-DD') AS start_date,
        territory_id,
        direction,
        sum(journeys)::int as journeys,
        sum(incented_journeys)::int as incented_journeys,
        sum(incentive_amount)::int as incentive_amount
      FROM ${this.tableByDay}
      WHERE ${conditions.join(" AND ")}
      GROUP BY 1,2,3
      ORDER BY start_date
    `;
    const response = await this.pg.getClient().query({
      text: queryText,
      values: queryValues,
    });
    return response.rows;
  }

  async getIncentiveByMonth(
    params: IncentiveByMonthParamsInterface,
  ): Promise<IncentiveByMonthResultInterface> {
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
        sum(journeys)::int as journeys,
        sum(incented_journeys)::int as incented_journeys,
        sum(incentive_amount)::int as incentive_amount
      FROM ${this.tableByMonth}
      WHERE ${conditions.join(" AND ")}
      GROUP BY 1,2,3,4
    `;
    const response = await this.pg.getClient().query({
      text: queryText,
      values: queryValues,
    });
    return response.rows;
  }
}
