import { provider } from "@/ilos/common/index.ts";
import { PostgresConnection } from "@/ilos/connection-postgres/index.ts";
import sql, { join, raw } from "@/lib/pg/sql.ts";
import {
  IncentiveByDayParamsInterface,
  IncentiveByDayResultInterface,
  IncentiveByMonthParamsInterface,
  IncentiveByMonthResultInterface,
  IncentiveRepositoryInterface,
  IncentiveRepositoryInterfaceResolver,
} from "../interfaces/IncentiveRepositoryInterface.ts";

@provider({
  identifier: IncentiveRepositoryInterfaceResolver,
})
export class IncentiveRepository implements IncentiveRepositoryInterface {
  private readonly tableByMonth = "dashboard_stats.operators_by_month";
  private readonly tableByDay = "dashboard_stats.operators_by_day";

  constructor(private pg: PostgresConnection) {}

  async getIncentiveByDay(
    params: IncentiveByDayParamsInterface,
  ): Promise<IncentiveByDayResultInterface> {
    const date = params.date ? new Date(params.date) : new Date();
    const direction = params.direction ? params.direction : "both";
    const filters = [
      sql`territory_id = ${params.territory_id}`,
      sql`start_date <= ${date.toISOString().split("T")[0]}`,
      sql`start_date >= ${new Date(date.setMonth(date.getMonth() - 2)).toISOString().split("T")[0]}`,
      sql`direction = ${direction}`,
    ];
    const query = sql`
      SELECT 
        to_char(start_date, 'YYYY-MM-DD') AS start_date,
        territory_id,
        direction,
        sum(journeys)::int as journeys,
        sum(incented_journeys)::int as incented_journeys,
        sum(incentive_amount)::int as incentive_amount
      FROM ${raw(this.tableByDay)}
      WHERE ${join(filters, ` AND `)}
      GROUP BY 1,2,3
      ORDER BY start_date
    `;
    const response = await this.pg.getClient().query(query);
    return response.rows;
  }

  async getIncentiveByMonth(
    params: IncentiveByMonthParamsInterface,
  ): Promise<IncentiveByMonthResultInterface> {
    const direction = params.direction ? params.direction : "both";
    const filters = [
      sql`territory_id = ${params.territory_id}`,
      sql`direction = ${direction}`,
    ];
    if (params.year) {
      filters.push(sql`year = ${params.year}`);
    }

    const query = sql`
      SELECT 
        year,
        month,
        territory_id,
        direction,
        sum(journeys)::int as journeys,
        sum(incented_journeys)::int as incented_journeys,
        sum(incentive_amount)::int as incentive_amount
      FROM ${raw(this.tableByMonth)}
      WHERE ${join(filters, " AND ")}
      GROUP BY 1,2,3,4
    `;
    const response = await this.pg.getClient().query(query);
    return response.rows;
  }
}
