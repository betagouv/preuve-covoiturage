import { provider } from "@/ilos/common/index.ts";
import { PostgresConnection } from "@/ilos/connection-postgres/index.ts";
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
    const queryValues: (string | number)[] = [];
    const conditions = ["hidden = false"];
    Object.entries(params).forEach(([k, v]) => {
      conditions.push(k === "id" ? `_${k}= $${queryValues.length + 1}` : `${k}= $${queryValues.length + 1}`);
      queryValues.push(v);
    });
    const queryText = `
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
      FROM ${this.table}
      WHERE ${conditions.join(" AND ")}
      ORDER BY _id
    `;
    const response = await this.pg.getClient().query({
      text: queryText,
      values: queryValues,
    });
    return response.rows;
  }
}
