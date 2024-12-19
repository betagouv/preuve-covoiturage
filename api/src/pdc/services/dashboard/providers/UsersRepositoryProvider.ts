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
    const queryValues: (string | number)[] = params.id ? [params.id] : [];
    const conditions = params.id ? ["_id=$1", "hidden = false"] : ["hidden = false"];
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
