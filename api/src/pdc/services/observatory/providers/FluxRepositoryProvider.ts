import { provider } from "@/ilos/common/index.ts";
import { PostgresConnection } from "@/ilos/connection-postgres/index.ts";
import {
  checkIndicParam,
  checkTerritoryParam,
} from "../helpers/checkParams.ts";
import {
  BestMonthlyFluxParamsInterface,
  BestMonthlyFluxResultInterface,
  EvolMonthlyFluxParamsInterface,
  EvolMonthlyFluxResultInterface,
  FluxRepositoryInterface,
  FluxRepositoryInterfaceResolver,
  GetFluxParamsInterface,
  GetFluxResultInterface,
  lastRecordMonthlyFluxResultInterface,
} from "../interfaces/FluxRepositoryProviderInterface.ts";

@provider({
  identifier: FluxRepositoryInterfaceResolver,
})
export class FluxRepositoryProvider implements FluxRepositoryInterface {
  private readonly perim_table = "geo.perimeters";
  private readonly table = (params: GetFluxParamsInterface) => {
    if (params.month) {
      return "observatoire.flux_by_month";
    }
    if (params.trimester) {
      return "observatoire.flux_by_trimester";
    }
    if (params.semester) {
      return "observatoire.flux_by_semester";
    }
    return "observatoire.flux_by_year";
  };
  constructor(private pg: PostgresConnection) {}
  // Retourne les données de la table observatory.monthly_flux pour le mois et l'année
  // et le type de territoire en paramètres
  // Paramètres optionnels observe et code pour filtrer les résultats sur un territoire
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

    const conditions: string[] = [
      `type = $3`, // Ajout dynamique du paramètre sécurisé pour "observe"
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

  // Retourne l'année et le mois du dernier enregistrement de la table observatory.monthly_flux
  async lastRecordMonthlyFlux(): Promise<lastRecordMonthlyFluxResultInterface> {
    const sql = `SELECT distinct year, month 
      FROM ${this.table} 
      WHERE type ='com' 
      AND year <= date_part('year', now())
      ORDER BY year DESC,month DESC
      LIMIT 1;
    `;
    const response = await this.pg.getClient().query(sql);
    return response.rows[0];
  }

  // Retourne les données pour les graphiques construits à partir de la table observatory.monthly_flux
  async getEvolMonthlyFlux(
    params: EvolMonthlyFluxParamsInterface,
  ): Promise<EvolMonthlyFluxResultInterface> {
    const checkArray = [
      "journeys",
      "passengers",
      "has_incentive",
      "distance",
      "duration",
    ];
    const indic = checkIndicParam(params.indic, checkArray, "journeys");
    const start = Number(params.year + String(params.month).padStart(2, "0"));
    const limit = params.past ? Number(params.past) * 12 + 1 : 25;
    const sql = {
      values: [checkTerritoryParam(params.type), params.code, limit],
      text: `
        SELECT year, month, sum(${indic}) AS ${indic} 
        ${indic == "distance" ? ", sum(journeys) AS journeys" : ""}
        FROM ${this.table}
        WHERE concat(year::varchar,TO_CHAR(month, 'fm00'))::integer <= ${start}
        AND type = $1
        AND (territory_1 = $2 OR territory_2 = $2)
        GROUP BY year, month
        ORDER BY (year,month) DESC
        LIMIT $3;
      `,
    };
    const response = await this.pg.getClient().query(sql);
    return response.rows;
  }

  // Retourne les données pour le top 10 des trajets dans le dashboard
  async getBestMonthlyFlux(
    params: BestMonthlyFluxParamsInterface,
  ): Promise<BestMonthlyFluxResultInterface> {
    const sql = {
      values: [params.year, params.month, params.code, params.limit],
      text: `
        SELECT territory_1, l_territory_1, territory_2, l_territory_2, journeys
        FROM ${this.table}
        WHERE year = $1
        AND month = $2
        AND (territory_1 IN (
            SELECT com FROM (SELECT com,epci,aom,dep,reg,country FROM ${this.perim_table} WHERE year = geo.get_latest_millesime_or( $1::smallint)) t 
            WHERE ${checkTerritoryParam(params.type)} = $3) 
          OR territory_2 IN (
            SELECT com FROM (SELECT com,epci,aom,dep,reg,country FROM ${this.perim_table} WHERE year = geo.get_latest_millesime_or( $1::smallint)) t 
            WHERE ${checkTerritoryParam(params.type)} = $3)
        ) 
        ORDER BY journeys DESC
        LIMIT $4;
      `,
    };
    const response = await this.pg.getClient().query(sql);
    return response.rows;
  }
}
