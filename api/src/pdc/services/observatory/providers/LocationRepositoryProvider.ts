import { provider } from "@/ilos/common/index.ts";
import { PostgresConnection } from "@/ilos/connection-postgres/index.ts";
import { latLngToCell } from "@/deps.ts";
import {
  LocationParamsInterface,
  LocationRepositoryInterface,
  LocationRepositoryInterfaceResolver,
  LocationResultInterface,
  LocationSqlResultInterface,
} from "../interfaces/LocationRepositoryProviderInterface.ts";
import { checkTerritoryParam } from "../helpers/checkParams.ts";

@provider({
  identifier: LocationRepositoryInterfaceResolver,
})
export class LocationRepositoryProvider implements LocationRepositoryInterface {
  private readonly table = "observatoire.view_location";
  private readonly perim_table = "geo.perimeters";

  constructor(private pg: PostgresConnection) {}

  async getLocation(
    params: LocationParamsInterface,
  ): Promise<LocationResultInterface> {
    const year = new Date(params.end_date).getFullYear();
    const result: LocationResultInterface = [];
    const sql = {
      values: [params.code, params.start_date, params.end_date, year],
      text: `
        SELECT start_lat as lat, 
        start_lon as lon 
        FROM ${this.table} 
        WHERE start_datetime BETWEEN $2 AND $3
        ${
        params.type && params.code
          ? `AND (
            start_geo_code IN (SELECT com FROM (SELECT com,epci,aom,dep,reg,country FROM ${this.perim_table} WHERE year = geo.get_latest_millesime_or( $4::smallint)) t WHERE ${
            checkTerritoryParam(
              params.type,
            )
          } = $1) 
            OR end_geo_code IN (SELECT com FROM (SELECT com,epci,aom,dep,reg,country FROM ${this.perim_table} WHERE year = geo.get_latest_millesime_or( $4::smallint)) t WHERE ${
            checkTerritoryParam(params.type)
          } = $1)
          )`
          : ""
        }
        UNION ALL
        SELECT end_lat as lat, 
        end_lon as lon 
        FROM ${this.table} 
        WHERE start_datetime BETWEEN $2 AND $3
        ${
        params.type && params.code
          ? `AND (
            start_geo_code IN (SELECT com FROM (SELECT com,epci,aom,dep,reg,country FROM ${this.perim_table} WHERE year = geo.get_latest_millesime_or( $4::smallint)) t WHERE ${
            checkTerritoryParam(
              params.type,
            )
          } = $1) 
            OR end_geo_code IN (SELECT com FROM (SELECT com,epci,aom,dep,reg,country FROM ${this.perim_table} WHERE year = geo.get_latest_millesime_or( $4::smallint)) t WHERE ${
            checkTerritoryParam(params.type)
          } = $1)
          )`
          : ""
      }
      `,
    };
    const response: { rowCount: number; rows: LocationSqlResultInterface } =
      await this.pg.getClient().query<any>(sql);
    const geomToHex = response.rows
      .map((r) => latLngToCell(r.lat, r.lon, params.zoom))
      .reduce((acc, curr) => ((acc[curr] = (acc[curr] || 0) + 1), acc), {});
    Object.entries(geomToHex).forEach(([key, val]) =>
      result.push({ hex: key, count: Number(val) })
    );
    return result;
  }
}
