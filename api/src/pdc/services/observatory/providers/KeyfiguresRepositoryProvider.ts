import { provider } from "@/ilos/common/index.ts";
import { PostgresConnection } from "@/ilos/connection-postgres/index.ts";
import { getTableName } from "@/pdc/services/observatory/helpers/tableName.ts";
import { checkTerritoryParam } from "../helpers/checkParams.ts";
import {
  KeyfiguresParamsInterface,
  KeyfiguresRepositoryInterface,
  KeyfiguresRepositoryInterfaceResolver,
  KeyfiguresResultInterface,
} from "../interfaces/KeyfiguresRepositoryProviderInterface.ts";

@provider({
  identifier: KeyfiguresRepositoryInterfaceResolver,
})
export class KeyfiguresRepositoryProvider
  implements KeyfiguresRepositoryInterface {
  private readonly table = (
    params: KeyfiguresParamsInterface,
    table: "flux" | "occupation" | "newcomer",
  ) => {
    return getTableName(params, "observatoire_stats", table);
  };
  constructor(private pg: PostgresConnection) {}

  // Retourne les données de la table observatory.monthly_flux pour le mois et l'année
  // et le type de territoire en paramètres
  // Paramètres optionnels observe et code pour filtrer les résultats sur un territoire
  async getKeyfigures(
    params: KeyfiguresParamsInterface,
  ): Promise<KeyfiguresResultInterface> {
    const typeParam = checkTerritoryParam(params.type);
    const joinOnB = [
      "(a.territory_1 = b.code OR a.territory_2 = b.code)",
      "a.type = b.type",
      "a.year = b.year",
    ];
    const joinOnC = [
      "(a.territory_1 = c.code OR a.territory_2 = c.code)",
      "a.type = c.type",
      "a.year = c.year",
    ];
    const conditions = [
      `a.year = $1`,
      `a.type = $2`,
      "b.code = $3",
      "c.code = $3",
    ];
    const intraJourneysConditions = [
      "territory_1 = territory_2",
      "year = $1",
      "type = $2",
      "territory_1 = $3",
    ];
    const queryValues = [
      params.year,
      typeParam,
      params.code,
    ];
    if (params.direction) {
      queryValues.push(params.direction);
      conditions.push(`b.direction = $4`);
      conditions.push(`c.direction = $4`);
    }
    if (params.month) {
      queryValues.push(params.month);
      joinOnB.push("a.month = b.month");
      joinOnC.push("a.month = c.month");
      params.direction
        ? intraJourneysConditions.push(`month = $5`)
        : intraJourneysConditions.push(`month = $4`);
      params.direction
        ? conditions.push(`a.month = $5`)
        : conditions.push(`a.month = $4`);
    }
    if (params.trimester) {
      queryValues.push(params.trimester);
      joinOnB.push("a.trimester = b.trimester");
      joinOnC.push("a.trimester = c.trimester");
      params.direction
        ? intraJourneysConditions.push(`trimester = $5`)
        : intraJourneysConditions.push(`trimester = $4`);
      params.direction
        ? conditions.push(`a.trimester = $5`)
        : conditions.push(`a.trimester = $4`);
    }
    if (params.semester) {
      queryValues.push(params.semester);
      joinOnB.push("a.semester = b.semester");
      joinOnC.push("a.semester = c.semester");
      params.direction
        ? intraJourneysConditions.push(`semester = $5`)
        : intraJourneysConditions.push(`semester = $4`);
      params.direction
        ? conditions.push(`a.semester = $5`)
        : conditions.push(`a.semester = $4`);
    }

    const intraJourneysQuery = `
      SELECT journeys 
      FROM ${this.table(params, "flux")}
      WHERE ${intraJourneysConditions.join(" AND ")}
    `;

    const queryText = `
      SELECT 
        b.code,b.libelle,b.direction,
        sum(a.passengers)::int AS passengers,
        sum(a.distance)::int AS distance,
        sum(a.duration)::int AS duration,
        b.journeys::int,
        (${intraJourneysQuery})::int as intra_journeys,
        b.occupation_rate::float,
        c.new_drivers::int,
        c.new_passengers::int
      FROM ${this.table(params, "flux")} a
      LEFT JOIN ${this.table(params, "occupation")} b ON ${
      joinOnB.join(" AND ")
    } 
      LEFT JOIN ${this.table(params, "newcomer")} c ON ${joinOnC.join(" AND ")}
      WHERE ${conditions.join(" AND ")}
      GROUP BY b.code,b.libelle,b.direction,b.journeys,b.occupation_rate,c.new_drivers,c.new_passengers;
    `;
    const response = await this.pg.getClient().query({
      text: queryText,
      values: queryValues,
    });
    return response.rows;
  }
}
