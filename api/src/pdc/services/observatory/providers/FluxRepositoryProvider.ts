import { provider } from "@/ilos/common/index.ts";
import { PostgresConnection } from "@/ilos/connection-postgres/index.ts";
import {
  checkIndicParam,
  checkTerritoryParam,
} from "@/pdc/services/observatory/helpers/checkParams.ts";
import { getTableName } from "@/pdc/services/observatory/helpers/tableName.ts";
import {
  FluxRepositoryInterface,
  FluxRepositoryInterfaceResolver,
  GetBestFluxParamsInterface,
  GetBestFluxResultInterface,
  GetEvolFluxParamsInterface,
  GetEvolFluxResultInterface,
  GetFluxParamsInterface,
  GetFluxResultInterface,
} from "@/pdc/services/observatory/interfaces/FluxRepositoryProviderInterface.ts";

@provider({
  identifier: FluxRepositoryInterfaceResolver,
})
export class FluxRepositoryProvider implements FluxRepositoryInterface {
  private readonly perim_table = "geo.perimeters";
  private readonly table = (
    params:
      | GetFluxParamsInterface
      | GetEvolFluxParamsInterface
      | GetBestFluxParamsInterface,
  ) => {
    return getTableName(params, "observatoire_stats", "flux");
  };
  constructor(private pg: PostgresConnection) {}

  async getFlux(
    params: GetFluxParamsInterface,
  ): Promise<GetFluxResultInterface> {
    const tableName = this.table(params);
    const observeParam = checkTerritoryParam(params.observe);
    const typeParam = checkTerritoryParam(params.type);

    const perimTableQuery = `
      SELECT ${observeParam} 
      FROM (
        SELECT com, epci, aom, dep, reg, country 
        FROM ${this.perim_table} 
        WHERE year = geo.get_latest_millesime_or($1::smallint)
      ) t 
      WHERE ${typeParam} = $2
    `;

    const conditions = [
      `type = $3`,
      `(distance / journeys) <= 80`,
      `(territory_1 IN (${perimTableQuery}) OR territory_2 IN (${perimTableQuery}))`,
      `territory_1 <> territory_2`,
      `year = $1`,
    ];

    const queryValues = [
      params.year,
      params.code,
      observeParam,
    ];

    if (params.month) {
      queryValues.push(params.month);
      conditions.push(`month = $4`);
    }
    if (params.trimester) {
      queryValues.push(params.trimester);
      conditions.push(`trimester = $4`);
    }
    if (params.semester) {
      queryValues.push(params.semester);
      conditions.push(`semester = $4`);
    }

    const queryText = `
      SELECT 
        l_territory_1 AS ter_1, lng_1, lat_1,
        l_territory_2 AS ter_2, lng_2, lat_2,
        passengers, distance, duration 
      FROM ${tableName}
      WHERE ${conditions.join(" AND ")}
    `;
    const response = await this.pg.getClient().query({
      text: queryText,
      values: queryValues,
    });
    return response.rows;
  }

  async getEvolFlux(
    params: GetEvolFluxParamsInterface,
  ): Promise<GetEvolFluxResultInterface> {
    const tableName = this.table(params);
    const indics = [
      "journeys",
      "passengers",
      "has_incentive",
      "distance",
      "duration",
    ];
    const indicParam = checkIndicParam(params.indic, indics, "journeys");
    const typeParam = checkTerritoryParam(params.type);
    const limit = params.past ? Number(params.past) * 12 + 1 : 25;
    const queryValues = [typeParam, params.code, limit];
    const selectedVar = [
      "year",
      `sum(${indicParam}) AS ${indicParam}`,
    ];
    const conditions = [
      `type = $1`,
      `(territory_1 = $2 OR territory_2 = $2)`,
    ];
    const groupBy = [
      "year",
    ];
    if (params.month) {
      selectedVar.push("month");
      groupBy.push("month");
    }
    if (params.trimester) {
      selectedVar.push("trimester");
      groupBy.push("trimester");
    }
    if (params.semester) {
      selectedVar.push("semester");
      groupBy.push("semester");
    }
    const queryText = `
      SELECT ${selectedVar.join(", ")} 
      ${indicParam == "distance" ? ", sum(journeys) AS journeys" : ""}
      FROM ${tableName}
      WHERE ${conditions.join(" AND ")}
      GROUP BY ${groupBy.join(", ")} 
      ORDER BY (${groupBy.join(", ")}) DESC
      LIMIT $3;
    `;

    const response = await this.pg.getClient().query({
      text: queryText,
      values: queryValues,
    });
    return response.rows;
  }

  // Retourne les données pour le top 10 des trajets dans le dashboard
  async getBestFlux(
    params: GetBestFluxParamsInterface,
  ): Promise<GetBestFluxResultInterface> {
    const tableName = this.table(params);
    const typeParam = checkTerritoryParam(params.type);
    const perimTableQuery = `
      SELECT com
      FROM (
        SELECT com, epci, aom, dep, reg, country 
        FROM ${this.perim_table} 
        WHERE year = geo.get_latest_millesime_or($1::smallint)
      ) t 
      WHERE ${typeParam} = $2
    `;
    const conditions = [
      `year = $1`,
      `(territory_1 IN (${perimTableQuery}) OR territory_2 IN (${perimTableQuery}))`,
    ];
    const queryValues = [
      params.year,
      params.code,
      params.limit,
    ];
    if (params.month) {
      queryValues.push(params.month);
      conditions.push(`month = $4`);
    }
    if (params.trimester) {
      queryValues.push(params.trimester);
      conditions.push(`trimester = $4`);
    }
    if (params.semester) {
      queryValues.push(params.semester);
      conditions.push(`semester = $4`);
    }
    const queryText = `
      SELECT territory_1, l_territory_1, territory_2, l_territory_2, journeys
      FROM ${tableName}
      WHERE ${conditions.join(" AND ")}
      ORDER BY journeys DESC
      LIMIT $3
    `;
    const response = await this.pg.getClient().query({
      text: queryText,
      values: queryValues,
    });
    return response.rows;
  }
}
