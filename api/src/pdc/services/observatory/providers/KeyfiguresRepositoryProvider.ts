import { provider } from "@/ilos/common/index.ts";
import { PostgresConnection } from "@/ilos/connection-postgres/index.ts";
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
    table: "flux" | "occupation",
  ) => {
    if (params.month) {
      return `observatoire.${table}_by_month`;
    }
    if (params.trimester) {
      return `observatoire.${table}_by_trimester`;
    }
    if (params.semester) {
      return `observatoire.${table}_by_semester`;
    }
    return `observatoire.${table}_by_year`;
  };
  constructor(private pg: PostgresConnection) {}

  // Retourne les données de la table observatory.monthly_flux pour le mois et l'année
  // et le type de territoire en paramètres
  // Paramètres optionnels observe et code pour filtrer les résultats sur un territoire
  async getKeyfigures(
    params: KeyfiguresParamsInterface,
  ): Promise<KeyfiguresResultInterface> {
    const typeParam = checkTerritoryParam(params.type);
    const joinOn = [
      "(a.territory_1 = b.code OR a.territory_2 = b.code)",
      "a.type = b.type",
      "a.year = b.year",
    ];
    const conditions = [
      `a.year = $1`,
      `a.type = $2`,
      "b.code = $3",
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

    if (params.month) {
      queryValues.push(params.month);
      joinOn.push("a.month = b.month");
      intraJourneysConditions.push("month = $4");
      conditions.push(`a.month = $4`);
    }
    if (params.trimester) {
      queryValues.push(params.trimester);
      joinOn.push("a.trimester = b.trimester");
      intraJourneysConditions.push("trimester = $4");
      conditions.push(`a.trimester = $4`);
    }
    if (params.semester) {
      queryValues.push(params.semester);
      joinOn.push("a.semester = b.semester");
      intraJourneysConditions.push("semester = $4");
      conditions.push(`a.semester = $4`);
    }

    const intraJourneysQuery = `
      SELECT journeys 
      FROM ${this.table(params, "flux")}
      WHERE ${intraJourneysConditions.join(" AND ")}
    `;

    const queryText = `
      SELECT 
        b.code,b.libelle,
        sum(a.passengers)::int AS passengers,
        sum(a.distance)::int AS distance,
        sum(a.duration)::int AS duration,
        b.journeys::int,
        (${intraJourneysQuery}) as intra_journeys,
        b.occupation_rate::float
      FROM ${this.table(params, "flux")} a
      LEFT JOIN ${this.table(params, "occupation")} b ON ${
      joinOn.join(" AND ")
    } 
      WHERE ${conditions.join(" AND ")}
      GROUP BY b.code,b.libelle,b.journeys,b.occupation_rate;
    `;
    const response = await this.pg.getClient().query({
      text: queryText,
      values: queryValues,
    });
    return response.rows;
  }
}
