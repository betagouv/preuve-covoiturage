import { provider } from "@/ilos/common/index.ts";
import { PostgresConnection } from "@/ilos/connection-postgres/index.ts";
import sql, { join, raw } from "@/lib/pg/sql.ts";
import {
  UsersParamsInterface,
  UsersRepositoryInterface,
  UsersRepositoryInterfaceResolver,
  UsersResultInterface,
} from "@/pdc/services/dashboard/interfaces/UsersRepositoryProviderInterface.ts";

@provider({
  identifier: UsersRepositoryInterfaceResolver,
})
export class UsersRepositoryProvider implements UsersRepositoryInterface {
  private readonly table = "auth.users";

  constructor(private pg: PostgresConnection) {}

  async getUsers(
    params: UsersParamsInterface,
  ): Promise<UsersResultInterface> {
    const filters = [sql`hidden = false`];
    if (params.id) {
      filters.push(sql`_id = ${params.id}`);
    }
    if (params.operator_id) {
      filters.push(sql`operator_id = ${params.operator_id}`);
    }
    if (params.territory_id) {
      filters.push(sql`territory_id = ${params.territory_id}`);
    }
    const query = sql`
      SELECT 
        _id as id,
        firstname,
        lastname,
        email,
        operator_id,
        territory_id,
        phone,
        status,
        role
      FROM ${raw(this.table)}
      WHERE ${join(filters, " AND ")}
      ORDER BY _id
    `;
    const response = await this.pg.getClient().query(query);
    return response.rows;
  }
}
