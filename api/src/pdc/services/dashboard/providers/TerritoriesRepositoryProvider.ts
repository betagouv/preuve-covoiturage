import { provider } from "@/ilos/common/index.ts";
import { PostgresConnection } from "@/ilos/connection-postgres/index.ts";
import sql, { join, raw } from "@/lib/pg/sql.ts";
import {
  TerritoriesParamsInterface,
  TerritoriesRepositoryInterface,
  TerritoriesRepositoryInterfaceResolver,
  TerritoriesResultInterface,
} from "@/pdc/services/dashboard/interfaces/TerritoriesRepositoryProviderInterface.ts";

@provider({
  identifier: TerritoriesRepositoryInterfaceResolver,
})
export class TerritoriesRepositoryProvider implements TerritoriesRepositoryInterface {
  private readonly table = "territory.territory_group";
  private readonly tableData = "dashboard_stats.operators_by_month";

  constructor(private pg: PostgresConnection) {}

  async getTerritories(params: TerritoriesParamsInterface): Promise<TerritoriesResultInterface> {
    const filters = [sql`_id IN (SELECT DISTINCT territory_id FROM ${raw(this.tableData)})`];
    if (params.id) {
      filters.push(sql`_id = ${params.id}`);
    }
    const query = sql`
      SELECT
        _id AS id,
        name
      FROM ${raw(this.table)} 
      WHERE ${join(filters, " AND ")}
      ORDER BY name
    `;
    console.log(query);
    const response = await this.pg.getClient().query(query);
    return response.rows;
  }
}
