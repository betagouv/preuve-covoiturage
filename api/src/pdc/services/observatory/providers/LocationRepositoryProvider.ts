import { provider } from '@/ilos/common/index.ts';
import { PostgresConnection } from '@/ilos/connection-postgres/index.ts';
import { latLngToCell } from '@/deps.ts';
import {
  LocationRepositoryInterface,
  LocationRepositoryInterfaceResolver,
  LocationParamsInterface,
  LocationResultInterface,
  LocationSqlResultInterface,
} from '../interfaces/LocationRepositoryProviderInterface.ts';
import { checkTerritoryParam } from '../helpers/checkParams.ts';

@provider({
  identifier: LocationRepositoryInterfaceResolver,
})
export class LocationRepositoryProvider implements LocationRepositoryInterface {
  private readonly table = 'carpool.carpools';
  private readonly perim_table = 'geo.perimeters';

  constructor(private pg: PostgresConnection) {}

  async getLocation(params: LocationParamsInterface): Promise<LocationResultInterface> {
    const year = new Date(params.end_date).getFullYear();
    const result: LocationResultInterface = [];
    const sql = {
      values: [params.code, params.start_date, params.end_date, year],
      text: `
        SELECT st_y(start_position::geometry) as lat, 
        st_x(start_position::geometry) as lon 
        FROM ${this.table} 
        WHERE datetime BETWEEN $2 AND $3
        AND status='ok'
        AND is_driver=false
        ${
          params.type && params.code
            ? `AND (
            start_geo_code IN (SELECT com FROM (SELECT com,epci,aom,dep,reg,country FROM ${
              this.perim_table
            } WHERE year = geo.get_latest_millesime_or( $4::smallint)) t WHERE ${checkTerritoryParam(
              params.type,
            )} = $1) 
            OR end_geo_code IN (SELECT com FROM (SELECT com,epci,aom,dep,reg,country FROM ${
              this.perim_table
            } WHERE year = geo.get_latest_millesime_or( $4::smallint)) t WHERE ${checkTerritoryParam(params.type)} = $1)
          )`
            : ''
        }
        UNION ALL
        SELECT st_y(end_position::geometry) as lat, 
        st_x(end_position::geometry) as lon 
        FROM ${this.table} 
        WHERE datetime BETWEEN $2 AND $3
        AND status='ok'
        AND is_driver=false
        ${
          params.type && params.code
            ? `AND (
            start_geo_code IN (SELECT com FROM (SELECT com,epci,aom,dep,reg,country FROM ${
              this.perim_table
            } WHERE year = geo.get_latest_millesime_or( $4::smallint)) t WHERE ${checkTerritoryParam(
              params.type,
            )} = $1) 
            OR end_geo_code IN (SELECT com FROM (SELECT com,epci,aom,dep,reg,country FROM ${
              this.perim_table
            } WHERE year = geo.get_latest_millesime_or( $4::smallint)) t WHERE ${checkTerritoryParam(params.type)} = $1)
          )`
            : ''
        }
      `,
    };
    const response: { rowCount: number; rows: LocationSqlResultInterface } = await this.pg.getClient().query<any>(sql);
    const geomToHex = response.rows
      .map((r) => latLngToCell(r.lat, r.lon, params.zoom))
      .reduce((acc, curr) => ((acc[curr] = (acc[curr] || 0) + 1), acc), {});
    Object.entries(geomToHex).forEach(([key, val]) => result.push({ hex: key, count: Number(val) }));
    return result;
  }
}
