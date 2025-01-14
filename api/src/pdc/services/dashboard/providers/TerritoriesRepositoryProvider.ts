import { provider } from "@/ilos/common/index.ts";
import { PostgresConnection } from "@/ilos/connection-postgres/index.ts";
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
    const queryValues: (string | number)[] = params.id ? [params.id] : [];
    const conditions = params.id
      ? ["_id=$1", `_id::varchar IN (SELECT DISTINCT territory_id FROM ${this.tableData})`]
      : [`_id::varchar IN (SELECT DISTINCT territory_id FROM ${this.tableData})`];
    const queryText = `
      SELECT
        _id AS id,
        name
      FROM ${this.table} 
      WHERE ${conditions.join(" AND ")}
      ORDER BY name
    `;
    const response = await this.pg.getClient().query({
      text: queryText,
      values: queryValues,
    });
    return response.rows;
  }
}
