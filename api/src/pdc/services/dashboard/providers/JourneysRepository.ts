import { provider } from "@/ilos/common/index.ts";
import { DenoPostgresConnection } from "@/ilos/connection-postgres/index.ts";
import sql, { join, raw } from "@/lib/pg/sql.ts";
import {
  JourneysIncentiveByDayParamsInterface,
  JourneysIncentiveByDayResultInterface,
  JourneysIncentiveByMonthParamsInterface,
  JourneysIncentiveByMonthResultInterface,
  JourneysOperatorsByDayParamsInterface,
  JourneysOperatorsByDayResultInterface,
  JourneysOperatorsByMonthParamsInterface,
  JourneysOperatorsByMonthResultInterface,
  JourneysRepositoryInterface,
  JourneysRepositoryInterfaceResolver,
} from "../interfaces/JourneysRepositoryInterface.ts";

@provider({
  identifier: JourneysRepositoryInterfaceResolver,
})
export class JourneysRepository implements JourneysRepositoryInterface {
  private readonly tableByMonth = "dashboard_stats.operators_by_month";
  private readonly tableByDay = "dashboard_stats.operators_by_day";

  constructor(private pgConnection: DenoPostgresConnection) {}

  async getIncentiveByDay(
    params: JourneysIncentiveByDayParamsInterface,
  ): Promise<JourneysIncentiveByDayResultInterface[]> {
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
        sum(journeys) as journeys,
        sum(incented_journeys) as incented_journeys,
        sum(incentive_amount) as incentive_amount
      FROM ${raw(this.tableByDay)}
      WHERE ${join(filters, ` AND `)}
      GROUP BY 1,2,3
      ORDER BY start_date
    `;
    const rows = await this.pgConnection.query<JourneysIncentiveByDayResultInterface>(query);
    return rows;
  }

  async getIncentiveByMonth(
    params: JourneysIncentiveByMonthParamsInterface,
  ): Promise<JourneysIncentiveByMonthResultInterface[]> {
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
        sum(journeys) as journeys,
        sum(incented_journeys) as incented_journeys,
        sum(incentive_amount) as incentive_amount
      FROM ${raw(this.tableByMonth)}
      WHERE ${join(filters, " AND ")}
      GROUP BY 1,2,3,4
    `;
    const rows = await this.pgConnection.query<JourneysIncentiveByMonthResultInterface>(query);
    return rows;
  }

  async getOperatorsByDay(
    params: JourneysOperatorsByDayParamsInterface,
  ): Promise<JourneysOperatorsByDayResultInterface[]> {
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
        operator_id,
        operator_name,
        journeys,
        incented_journeys,
        incentive_amount
      FROM ${raw(this.tableByDay)}
      WHERE ${join(filters, " AND ")}
      ORDER BY start_date
    `;
    const rows = await this.pgConnection.query<JourneysOperatorsByDayResultInterface>(query);
    return rows;
  }

  async getOperatorsByMonth(
    params: JourneysOperatorsByMonthParamsInterface,
  ): Promise<JourneysOperatorsByMonthResultInterface[]> {
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
        operator_id,
        operator_name,
        journeys,
        incented_journeys,
        incentive_amount
      FROM ${raw(this.tableByMonth)}
      WHERE ${join(filters, " AND ")}
    `;
    const rows = await this.pgConnection.query<JourneysOperatorsByMonthResultInterface>(query);
    return rows;
  }
}
