import { provider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';
import { latLngToCell } from 'h3-js';
import {
  LocationRepositoryInterface,
  LocationRepositoryInterfaceResolver,
  LocationParamsInterface,
  LocationResultInterface,
  LocationSqlResultInterface,
} from '../interfaces/LocationRepositoryProviderInterface';
import { checkTerritoryParam } from '../helpers/checkParams';

@provider({
  identifier: LocationRepositoryInterfaceResolver,
})
export class LocationRepositoryProvider implements LocationRepositoryInterface {
  private readonly table = 'carpool.carpools';
  private readonly perim_table = 'geo.perimeters';

  constructor(private pg: PostgresConnection) {}

  async getLocation(params: LocationParamsInterface): Promise<LocationResultInterface> {
    const year = params.end_date.substring(0, 4);
    const result: LocationResultInterface = [];
    const sql = {
      values: [params.code, params.start_date, params.end_date],
      text: `
        SELECT st_y(start_position::geometry) as lon, 
        st_x(start_position::geometry) as lat 
        FROM ${this.table} 
        WHERE datetime BETWEEN $2 AND $3
        AND status='ok'
        AND is_driver=false
        ${
          params.t && params.code
            ? `AND (
            start_geo_code IN (SELECT com FROM (SELECT com,epci,aom,dep,reg,country FROM ${
              this.perim_table
            } WHERE year = ${year}) t WHERE ${checkTerritoryParam(params.t)} = $1) 
            OR end_geo_code IN (SELECT com FROM (SELECT com,epci,aom,dep,reg,country FROM ${
              this.perim_table
            } WHERE year = ${year}) t WHERE ${checkTerritoryParam(params.t)} = $1)
          )`
            : ''
        }
        UNION ALL
        SELECT st_y(end_position::geometry) as lon, 
        st_x(end_position::geometry) as lat 
        FROM ${this.table} 
        WHERE datetime BETWEEN $2 AND $3
        AND status='ok'
        AND is_driver=false
        ${
          params.t && params.code
            ? `AND (
            start_geo_code IN (SELECT com FROM (SELECT com,epci,aom,dep,reg,country FROM ${
              this.perim_table
            } WHERE year = ${year}) t WHERE ${checkTerritoryParam(params.t)} = $1) 
            OR end_geo_code IN (SELECT com FROM (SELECT com,epci,aom,dep,reg,country FROM ${
              this.perim_table
            } WHERE year = ${year}) t WHERE ${checkTerritoryParam(params.t)} = $1)
          )`
            : ''
        }
      `,
    };
    const response: { rowCount: number; rows: LocationSqlResultInterface } = await this.pg.getClient().query(sql);
    const geomToHex = response.rows
      .map((r) => latLngToCell(r.lat, r.lon, params.zoom))
      .reduce((acc, curr) => ((acc[curr] = (acc[curr] || 0) + 1), acc), {});
    Object.entries(geomToHex).forEach(([key, val]) => result.push({ hex: key, count: Number(val) }));
    return result;
  }
}
