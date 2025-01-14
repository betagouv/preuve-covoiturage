import { provider } from "@/ilos/common/index.ts";
import { PostgresConnection } from "@/ilos/connection-postgres/index.ts";
import sql, { raw } from "@/lib/pg/sql.ts";
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
    const filters = [`_id IN (SELECT DISTINCT territory_id FROM ${this.tableData})`];
    if (params.id) {
      filters.push(`_id = ${params.id}`);
    }
    const query = sql`
      SELECT
        _id AS id,
        name
      FROM ${raw(this.table)} 
      WHERE ${raw(filters.join(" AND "))}
      ORDER BY name
    `;
    const response = await this.pg.getClient().query(query);
    return response.rows;
  }
}
