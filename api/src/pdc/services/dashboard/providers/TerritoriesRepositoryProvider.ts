import { provider } from "@/ilos/common/index.ts";
import { PostgresConnection } from "@/ilos/connection-postgres/index.ts";
import {
  TerritoriesRepositoryInterface,
  TerritoriesRepositoryInterfaceResolver,
  TerritoriesResultInterface,
} from "@/pdc/services/dashboard/interfaces/TerritoriesRepositoryProviderInterface.ts";

@provider({
  identifier: TerritoriesRepositoryInterfaceResolver,
})
export class TerritoriesRepositoryProvider implements TerritoriesRepositoryInterface {
  private readonly table = "territory.territory_group";

  constructor(private pg: PostgresConnection) {}

  async getTerritories(): Promise<TerritoriesResultInterface> {
    const queryText = `
      SELECT
        _id AS id,
        name
      FROM ${this.table} 
      ORDER BY name
    `;
    const response = await this.pg.getClient().query({
      text: queryText,
    });
    return response.rows;
  }
}
