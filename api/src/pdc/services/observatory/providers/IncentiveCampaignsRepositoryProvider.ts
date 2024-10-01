import { provider } from "@/ilos/common/index.ts";
import { PostgresConnection } from "@/ilos/connection-postgres/index.ts";
import { checkTerritoryParam } from "../helpers/checkParams.ts";
import {
  CampaignsParamsInterface,
  CampaignsResultInterface,
  IncentiveCampaignsRepositoryInterface,
  IncentiveCampaignsRepositoryInterfaceResolver,
} from "../interfaces/IncentiveCampaignsRepositoryProviderInterface.ts";

@provider({
  identifier: IncentiveCampaignsRepositoryInterfaceResolver,
})
export class IncentiveCampaignsRepositoryProvider
  implements IncentiveCampaignsRepositoryInterface {
  private readonly table = "observatoire_stats.incentive_campaigns";
  private readonly perim_table = "geo_stats.perimeters_aggregate";

  constructor(private pg: PostgresConnection) {}

  async getCampaigns(
    params: CampaignsParamsInterface,
  ): Promise<CampaignsResultInterface> {
    const typeParam = params.type !== undefined
      ? checkTerritoryParam(params.type)
      : null;
    const queryValues: (string | number)[] = [];
    const conditions = [
      `b.geom IS NOT NULL`,
    ];
    if (params.code) {
      queryValues.push(params.code);
      params.year
        ? conditions.push(`left(a.code,9) = $2`)
        : conditions.push(`left(a.code,9) = $1`);
    }
    if (params.year && !params.code) {
      queryValues.push(params.year);
      //conditions.push(`right(a.date_debut,4) = $1::varchar`);
      conditions.push(`right(a.date_fin,4) = $1::varchar`);
      conditions.push(`to_date(a.date_fin,'DD/MM/YYYY') < now()`);
    }
    if (params.year && params.code) {
      queryValues.push(params.year);
      //conditions.push(`right(a.date_debut,4) = $2::varchar`);
      conditions.push(`right(a.date_fin,4) = $2::varchar`);
    }
    if (!params.year && !params.code) {
      conditions.push(`to_date(a.date_fin,'DD/MM/YYYY') > now()`);
    }
    if (typeParam) {
      conditions.push(`a.type = '${typeParam}'`);
    }
    const queryText = `
      SELECT a.*, ST_AsGeoJSON(b.geom,6)::json as geom
      FROM ${this.table} a 
      LEFT JOIN ${this.perim_table} b on a.type = b.type AND left(a.code,9) = b.code 
      AND b.year = geo.get_latest_millesime()
      WHERE ${conditions.join(" AND ")}
    `;
    const response = await this.pg.getClient().query({
      text: queryText,
      values: queryValues,
    });
    return response.rows;
  }
}
