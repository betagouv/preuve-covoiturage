import { provider } from "@/ilos/common/index.ts";
import { PostgresConnection } from "@/ilos/connection-postgres/index.ts";
import {
  checkIndicParam,
  checkTerritoryParam,
} from "@/pdc/services/observatory/helpers/checkParams.ts";
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
    if (params.month) {
      return "observatoire.occupation_by_month";
    }
    if (params.trimester) {
      return "observatoire.occupation_by_trimester";
    }
    if (params.semester) {
      return "observatoire.occupation_by_semester";
    }
    return "observatoire.occupation_by_year";
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
    const checkArray = [
      "journeys",
      "trips",
      "has_incentive",
      "occupation_rate",
    ];
    const start = Number(params.year + String(params.month).padStart(2, "0"));
    const limit = params.past ? Number(params.past) * 12 + 1 : 25;
    const sql = {
      values: [checkTerritoryParam(params.type), params.code, limit],
      text: `
        SELECT year, month, ${
        checkIndicParam(params.indic, checkArray, "journeys")
      }
        FROM ${this.table}
        WHERE concat(year::varchar,TO_CHAR(month, 'fm00'))::integer <= ${start}
        AND type = $1::observatory._occupation_type_enum
        AND territory = $2
        ORDER BY (year,month) DESC
        LIMIT $3;
      `,
    };
    const response: {
      rowCount: number;
      rows: EvolOccupationResultInterface;
    } = await this.pg
      .getClient()
      .query<any>(sql);
    return response.rows;
  }

  // Retourne les données pour le top 10 des territoires dans le dashboard
  async getBestTerritories(
    params: BestTerritoriesParamsInterface,
  ): Promise<BestTerritoriesResultInterface> {
    const sql = {
      values: [
        params.year,
        params.month,
        params.observe,
        params.code,
        params.limit,
      ],
      text: `
        SELECT territory, l_territory, journeys
        FROM ${this.table}
        WHERE year = $1
        AND month = $2
        AND type = $3::observatory._occupation_type_enum
        AND territory IN (
          SELECT ${
        checkTerritoryParam(params.observe)
      } FROM (SELECT com,epci,aom,dep,reg,country FROM ${this.perim_table} WHERE year = geo.get_latest_millesime_or( $1::smallint)) t 
          WHERE ${checkTerritoryParam(params.type)} = $4
        ) 
        ORDER BY journeys DESC
        LIMIT $5;
      `,
    };
    const response: {
      rowCount: number;
      rows: BestTerritoriesResultInterface;
    } = await this.pg
      .getClient()
      .query<any>(sql);
    return response.rows;
  }
}
