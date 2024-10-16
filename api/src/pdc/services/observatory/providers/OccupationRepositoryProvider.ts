import { provider } from "@/ilos/common/index.ts";
import { PostgresConnection } from "@/ilos/connection-postgres/index.ts";
import {
  checkIndicParam,
  checkTerritoryParam,
} from "@/pdc/services/observatory/helpers/checkParams.ts";
import { getTableName } from "@/pdc/services/observatory/helpers/tableName.ts";
import {
  BestTerritoriesParamsInterface,
  BestTerritoriesResultInterface,
  EvolOccupationParamsInterface,
  EvolOccupationResultInterface,
  OccupationParamsInterface,
  OccupationRepositoryInterface,
  OccupationRepositoryInterfaceResolver,
  OccupationResultInterface,
} from "@/pdc/services/observatory/interfaces/OccupationRepositoryProviderInterface.ts";

@provider({
  identifier: OccupationRepositoryInterfaceResolver,
})
export class OccupationRepositoryProvider
  implements OccupationRepositoryInterface {
  private readonly table = (
    params:
      | OccupationParamsInterface
      | EvolOccupationParamsInterface
      | BestTerritoriesParamsInterface,
  ) => {
    return getTableName(params, "observatoire_stats", "occupation");
  };
  private readonly perim_table = "geo.perimeters";

  constructor(private pg: PostgresConnection) {}

  async getOccupation(
    params: OccupationParamsInterface,
  ): Promise<OccupationResultInterface> {
    const tableName = this.table(params);
    const observeParam = checkTerritoryParam(params.observe);
    const typeParam = checkTerritoryParam(params.type);
    const selectedVar = [
      "year",
      "type",
      "code",
      "libelle",
      "journeys",
      "occupation_rate",
      "geom",
    ];
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
      `year = $1`,
      `type = $3`,
      `code IN (${perimTableQuery})`,
      `direction = $4`,
    ];

    const queryValues = [
      params.year,
      params.code,
      observeParam,
      params.direction,
    ];

    if (params.month) {
      queryValues.push(params.month);
      conditions.push(`month = $5`);
    }
    if (params.trimester) {
      queryValues.push(params.trimester);
      conditions.push(`trimester = $5`);
    }
    if (params.semester) {
      queryValues.push(params.semester);
      conditions.push(`semester = $5`);
    }

    const queryText = `
      SELECT 
      ${selectedVar.join(", ")}
      FROM ${tableName}
      WHERE ${conditions.join(" AND ")}
    `;
    const response = await this.pg.getClient().query({
      text: queryText,
      values: queryValues,
    });
    return response.rows;
  }

  // Retourne les données pour les graphiques construits à partir de la table observatory._occupation
  async getEvolOccupation(
    params: EvolOccupationParamsInterface,
  ): Promise<EvolOccupationResultInterface> {
    const tableName = this.table(params);
    const indics = [
      "journeys",
      "trips",
      "has_incentive",
      "occupation_rate",
    ];
    const indicParam = checkIndicParam(params.indic, indics, "journeys");
    const typeParam = checkTerritoryParam(params.type);
    const limit = params.past ? Number(params.past) * 12 + 1 : 25;
    const queryValues = [typeParam, params.code, limit];
    const selectedVar = [
      "year",
      `${indicParam}`,
    ];
    const conditions = [
      `type = $1`,
      `code = $2`,
      `direction = 'both'`,
    ];
    const orderBy = [
      "year",
    ];
    if (params.month) {
      selectedVar.push("month");
      orderBy.push("month");
    }
    if (params.trimester) {
      selectedVar.push("trimester");
      orderBy.push("trimester");
    }
    if (params.semester) {
      selectedVar.push("semester");
      orderBy.push("semester");
    }
    const queryText = `
      SELECT ${selectedVar.join(", ")}
      FROM ${tableName}
      WHERE ${conditions.join(" AND ")}
      ORDER BY (${orderBy.join(", ")}) DESC
      LIMIT $3;
    `;

    const response = await this.pg.getClient().query({
      text: queryText,
      values: queryValues,
    });
    return response.rows;
  }

  // Retourne les données pour le top 10 des territoires dans le dashboard
  async getBestTerritories(
    params: BestTerritoriesParamsInterface,
  ): Promise<BestTerritoriesResultInterface> {
    const tableName = this.table(params);
    const typeParam = checkTerritoryParam(params.type);
    const observeParam = checkTerritoryParam(params.observe);
    const queryValues = [params.year, params.code, observeParam, params.limit];
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
      `year = $1`,
      `type = $3`,
      `direction = 'both'`,
      `code IN (${perimTableQuery})`,
    ];
    if (params.month) {
      queryValues.push(params.month);
      conditions.push(`month = $5`);
    }
    if (params.trimester) {
      queryValues.push(params.trimester);
      conditions.push(`trimester = $5`);
    }
    if (params.semester) {
      queryValues.push(params.semester);
      conditions.push(`semester = $5`);
    }
    const queryText = `
      SELECT code, libelle, journeys
      FROM ${tableName}
      WHERE ${conditions.join(" AND ")}
      ORDER BY journeys DESC
      LIMIT $4;
    `;

    const response = await this.pg.getClient().query({
      text: queryText,
      values: queryValues,
    });
    return response.rows;
  }
}
