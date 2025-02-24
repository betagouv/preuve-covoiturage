import { provider } from "@/ilos/common/index.ts";
import { PostgresConnection } from "@/ilos/connection-postgres/index.ts";
import sql, { join, raw } from "@/lib/pg/sql.ts";
import {
  OperatorsByDayParamsInterface,
  OperatorsByDayResultInterface,
  OperatorsByMonthParamsInterface,
  OperatorsByMonthResultInterface,
  OperatorsParamsInterface,
  OperatorsRepositoryInterface,
  OperatorsRepositoryInterfaceResolver,
  OperatorsResultInterface,
} from "../interfaces/OperatorsRepositoryInterface.ts";

@provider({
  identifier: OperatorsRepositoryInterfaceResolver,
})
export class OperatorsRepository implements OperatorsRepositoryInterface {
  private readonly table = "operator.operators";
  private readonly tableByMonth = "dashboard_stats.operators_by_month";
  private readonly tableByDay = "dashboard_stats.operators_by_day";

  constructor(private pg: PostgresConnection) {}

  async getOperators(
    params: OperatorsParamsInterface,
  ): Promise<OperatorsResultInterface> {
    const filters = [sql`deleted_at is null`];
    if (params.id) {
      filters.push(sql`_id=${params.id}`);
    }
    const query = sql`
      SELECT 
        _id as id,
        name,
        legal_name,
        siret
      FROM ${raw(this.table)}
      WHERE ${join(filters, " AND ")}
      ORDER BY _id
    `;
    const response = await this.pg.getClient().query(query);
    return response.rows;
  }
  async getOperatorsByDay(
    params: OperatorsByDayParamsInterface,
  ): Promise<OperatorsByDayResultInterface> {
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
        journeys::int,
        incented_journeys::int,
        incentive_amount::int
      FROM ${raw(this.tableByDay)}
      WHERE ${join(filters, " AND ")}
      ORDER BY start_date
    `;
    const response = await this.pg.getClient().query(query);
    return response.rows;
  }

  async getOperatorsByMonth(
    params: OperatorsByMonthParamsInterface,
  ): Promise<OperatorsByMonthResultInterface> {
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
        journeys::int,
        incented_journeys::int,
        incentive_amount::int
      FROM ${raw(this.tableByMonth)}
      WHERE ${join(filters, " AND ")}
    `;
    const response = await this.pg.getClient().query(query);
    return response.rows;
  }
}
