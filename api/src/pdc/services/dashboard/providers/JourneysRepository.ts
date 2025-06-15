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
  private readonly tableByMonth = "dashboard_stats.territories_by_month";
  private readonly tableByDay = "dashboard_stats.territories_by_day";
  private readonly tableOperators = "operator.operators";

  constructor(private pgConnection: DenoPostgresConnection) {}

  async getIncentiveByDay(
    params: JourneysIncentiveByDayParamsInterface,
  ): Promise<JourneysIncentiveByDayResultInterface[]> {
    const date = params.date ? new Date(params.date) : new Date();
    const filters = [
      sql`territory_id = ${params.territory_id}`,
      sql`start_date <= ${date.toISOString().split("T")[0]}`,
      sql`start_date >= ${new Date(date.setMonth(date.getMonth() - 2)).toISOString().split("T")[0]}`,
    ];
    const query = sql`
      SELECT 
        to_char(start_date, 'YYYY-MM-DD') AS start_date,
        territory_id,
        sum(journeys) as journeys,
        sum(incented_journeys) as incented_journeys,
        sum(incentive_amount) as incentive_amount
      FROM ${raw(this.tableByDay)}
      WHERE ${join(filters, ` AND `)}
      GROUP BY 1,2
      ORDER BY 1
    `;
    const rows = await this.pgConnection.query<JourneysIncentiveByDayResultInterface>(query);
    return rows;
  }

  async getIncentiveByMonth(
    params: JourneysIncentiveByMonthParamsInterface,
  ): Promise<JourneysIncentiveByMonthResultInterface[]> {
    const filters = [
      sql`territory_id = ${params.territory_id}`,
    ];
    if (params.year) {
      filters.push(sql`year = ${params.year}`);
    }

    const query = sql`
      SELECT 
        year,
        month,
        territory_id,
        sum(journeys) as journeys,
        sum(incented_journeys) as incented_journeys,
        sum(incentive_amount) as incentive_amount
      FROM ${raw(this.tableByMonth)}
      WHERE ${join(filters, " AND ")}
      GROUP BY 1,2,3
      ORDER BY 1,2
    `;
    const rows = await this.pgConnection.query<JourneysIncentiveByMonthResultInterface>(query);
    return rows;
  }

  async getOperatorsByDay(
    params: JourneysOperatorsByDayParamsInterface,
  ): Promise<JourneysOperatorsByDayResultInterface[]> {
    const date = params.date ? new Date(params.date) : new Date();
    const filters = [
      sql`territory_id = ${params.territory_id}`,
      sql`start_date <= ${date.toISOString().split("T")[0]}`,
      sql`start_date >= ${new Date(date.setMonth(date.getMonth() - 2)).toISOString().split("T")[0]}`,
    ];

    const query = sql`
      SELECT 
        to_char(a.start_date, 'YYYY-MM-DD') AS start_date,
        territory_id,
        a.operator_id,
        b.name as operator_name,
        a.journeys,
        a.incented_journeys,
        a.incentive_amount
      FROM ${raw(this.tableByDay)} AS a
      LEFT JOIN ${raw(this.tableOperators)} AS b ON b._id = a.operator_id
      WHERE ${join(filters, " AND ")}
      ORDER BY 1,2,3
    `;
    const rows = await this.pgConnection.query<JourneysOperatorsByDayResultInterface>(query);
    return rows;
  }

  async getOperatorsByMonth(
    params: JourneysOperatorsByMonthParamsInterface,
  ): Promise<JourneysOperatorsByMonthResultInterface[]> {
    const filters = [
      sql`territory_id = ${params.territory_id}`,
    ];
    if (params.year) {
      filters.push(sql`year = ${params.year}`);
    }
    const query = sql`
      SELECT 
        a.year,
        a.month,
        a.territory_id,
        a.operator_id,
        b.name as operator_name,
        a.journeys,
        a.incented_journeys,
        a.incentive_amount
      FROM ${raw(this.tableByMonth)} AS a
      LEFT JOIN ${raw(this.tableOperators)} AS b ON b._id = a.operator_id
      WHERE ${join(filters, " AND ")}
      ORDER BY 1,2,3,4
    `;
    const rows = await this.pgConnection.query<JourneysOperatorsByMonthResultInterface>(query);
    return rows;
  }
}
