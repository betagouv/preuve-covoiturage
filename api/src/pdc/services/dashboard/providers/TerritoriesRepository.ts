import { NotFoundException, provider } from "@/ilos/common/index.ts";
import { PostgresConnection } from "@/ilos/connection-postgres/index.ts";
import sql, { join, raw } from "@/lib/pg/sql.ts";
import {
  CreateTerritoryDataInterface,
  CreateTerritoryResultInterface,
  DeleteTerritoryParamsInterface,
  DeleteTerritoryResultInterface,
  TerritoriesParamsInterface,
  TerritoriesRepositoryInterface,
  TerritoriesRepositoryInterfaceResolver,
  TerritoriesResultInterface,
  UpdateTerritoryDataInterface,
  UpdateTerritoryResultInterface,
} from "../interfaces/TerritoriesRepositoryInterface.ts";

@provider({
  identifier: TerritoriesRepositoryInterfaceResolver,
})
export class TerritoriesRepository implements TerritoriesRepositoryInterface {
  private readonly table = "territory.territory_group";
  private readonly tableData = "dashboard_stats.operators_by_month";

  constructor(private pg: PostgresConnection) {}

  async getTerritories(params: TerritoriesParamsInterface): Promise<TerritoriesResultInterface> {
    const filters = [
      sql`_id IN (SELECT DISTINCT territory_id FROM ${raw(this.tableData)})`,
      sql`deleted_at IS null`,
    ];
    if (params.id) {
      filters.push(sql`_id = ${params.id}`);
    }
    const limit = params.limit || 25;
    const page = params.page || 1;
    const offset = (page - 1) * limit;
    const query = sql`
      SELECT
        _id AS id,
        name
      FROM ${raw(this.table)} 
      WHERE ${join(filters, " AND ")}
      ORDER BY name
      LIMIT ${limit} OFFSET ${offset}
    `;
    const response = await this.pg.getClient().query(query);
    // Calcul du nombre total d'éléments
    const countQuery = sql`
      SELECT COUNT(*) as total
      FROM ${raw(this.table)}
      WHERE ${join(filters, " AND ")}
    `;
    const countResponse = await this.pg.getClient().query(countQuery);
    return {
      meta: {
        total: parseInt(countResponse.rows[0].total, 10),
        page: page,
        totalPages: Math.ceil(parseInt(countResponse.rows[0].total, 10) / limit),
      },
      data: response.rows,
    };
  }
  async createTerritory(
    data: CreateTerritoryDataInterface,
  ): Promise<CreateTerritoryResultInterface> {
    const query = sql`
      INSERT INTO ${raw(this.table)} (
        name, level
      ) VALUES (
        ${data.name}, ${data.level}
      RETURNING
        _id, created_at, name, level
    `;
    const response = await this.pg.getClient().query(query);
    if (response.rowCount !== 1) {
      throw new Error(`Unable to create territory ${data}`);
    }
    return {
      success: true,
      message: `territory ${JSON.stringify(response.rows[0])} created`,
    };
  }

  async deleteTerritory(
    params: DeleteTerritoryParamsInterface,
  ): Promise<DeleteTerritoryResultInterface> {
    const query = sql`
      UPDATE ${raw(this.table)}
      SET deleted_at = NOW()
      WHERE _id = ${params.id}
    `;
    const response = await this.pg.getClient().query(query);
    if (response.rowCount !== 1) {
      throw new NotFoundException(`territory not found: (${params.id})`);
    }
    return { success: true, message: `Territory ${params.id} deleted` };
  }

  async updateTerritory(
    data: UpdateTerritoryDataInterface,
  ): Promise<UpdateTerritoryResultInterface> {
    const query = sql`
      UPDATE ${raw(this.table)}
      SET 
        nom = ${data.nom},
        updated_at = now(),
        level = ${data.level},
      WHERE _id = ${data.id}
      RETURNING _id, updated_at, name, level
    `;
    const response = await this.pg.getClient().query(query);
    if (response.rowCount !== 1) {
      throw new Error(`Unable to update territory with id ${data.id}`);
    }
    return {
      success: true,
      message: `Territory ${JSON.stringify(response.rows[0])} updated`,
    };
  }
}
