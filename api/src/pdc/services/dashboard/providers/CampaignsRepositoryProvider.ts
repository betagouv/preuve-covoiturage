import { provider } from "@/ilos/common/index.ts";
import { PostgresConnection } from "@/ilos/connection-postgres/index.ts";
import {
  CampaignsParamsInterface,
  CampaignsRepositoryInterface,
  CampaignsRepositoryInterfaceResolver,
  CampaignsResultInterface,
} from "@/pdc/services/dashboard/interfaces/CampaignsRepositoryProviderInterface.ts";

@provider({
  identifier: CampaignsRepositoryInterfaceResolver,
})
export class CampaignsRepositoryProvider implements CampaignsRepositoryInterface {
  private readonly table = "policy.policies";
  private readonly tableTerritory = "territory.territory_group";

  constructor(private pg: PostgresConnection) {}

  async getCampaigns(
    params: CampaignsParamsInterface,
  ): Promise<CampaignsResultInterface> {
    const queryValues: (string | number)[] = [];
    const conditions = [];
    if (params.territory_id) {
      queryValues.push(params.territory_id);
      conditions.push(`territory_id = $1`);
    }

    const queryText = `
      SELECT 
        a._id AS id,
        to_char(a.start_date, 'YYYY-MM-DD') AS start_date,
        to_char(a.end_date, 'YYYY-MM-DD') AS end_date,
        a.territory_id,
        b.name as territory_name,
        a.name,
        a.description,
        a.unit,
        a.status,
        a.handler,
        a.incentive_sum::int,
        a.max_amount::int
      FROM ${this.table} a
      LEFT JOIN ${this.tableTerritory} b on a.territory_id = b._id
      ${conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""}
      ORDER BY a.start_date desc
    `;
    const response = await this.pg.getClient().query({
      text: queryText,
      values: queryValues,
    });
    return response.rows;
  }
}
