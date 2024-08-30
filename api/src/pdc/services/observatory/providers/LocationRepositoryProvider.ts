import { latLngToCell } from "@/deps.ts";
import { provider } from "@/ilos/common/index.ts";
import { PostgresConnection } from "@/ilos/connection-postgres/index.ts";
import { checkTerritoryParam } from "../helpers/checkParams.ts";
import {
  LocationParamsInterface,
  LocationRepositoryInterface,
  LocationRepositoryInterfaceResolver,
  LocationResultInterface,
} from "../interfaces/LocationRepositoryProviderInterface.ts";

@provider({
  identifier: LocationRepositoryInterfaceResolver,
})
export class LocationRepositoryProvider implements LocationRepositoryInterface {
  private readonly table = "observatoire_stats.view_location";
  private readonly perim_table = "geo.perimeters";

  constructor(private pg: PostgresConnection) {}

  async getLocation(
    params: LocationParamsInterface,
  ): Promise<LocationResultInterface> {
    const result: LocationResultInterface = [];
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
      `extract('year' from start_datetime) = $1`,
      `(start_geo_code IN (${perimTableQuery}) OR end_geo_code IN (${perimTableQuery}))`,
    ];

    const queryValues = [
      params.year,
      params.code,
    ];

    if (params.month) {
      queryValues.push(params.month);
      conditions.push(`extract('month' from start_datetime) = $3`);
    }
    if (params.trimester) {
      queryValues.push(params.trimester);
      conditions.push(`extract('quarter' FROM start_datetime) = $3`);
    }
    if (params.semester) {
      queryValues.push(params.semester);
      conditions.push(
        `(CASE WHEN extract('quarter' FROM start_datetime)::int > 3 THEN 2 ELSE 1 END) = $3`,
      );
    }

    const queryText = `
      SELECT 
        start_lat as lat, 
        start_lon as lon
      FROM ${this.table}
      WHERE ${conditions.join(" AND ")}
      UNION ALL
      SELECT
        end_lat as lat, 
        end_lon as lon
      FROM ${this.table} 
      WHERE ${conditions.join(" AND ")}
    `;
    const response = await this.pg.getClient().query({
      text: queryText,
      values: queryValues,
    });
    const geomToHex = response.rows
      .map((r) => latLngToCell(r.lat, r.lon, params.zoom))
      .reduce<Record<string, number>>(
        (acc, curr) => ((acc[curr] = (acc[curr] || 0) + 1), acc),
        {},
      );
    Object.entries(geomToHex).forEach(([key, val]) =>
      result.push({ hex: key, count: Number(val) })
    );
    return result;
  }
}
