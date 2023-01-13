import { provider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';
import {
  
} from '../interfaces/FluxRepositoryProviderInterface';
import { checkTerritoryParam } from '../helpers/checkParams';

@provider({
  identifier: LocationRepositoryInterfaceResolver,
})
export class LocationRepositoryProvider implements LocationRepositoryInterface {
  private readonly table = 'carpool.carpools';
  private readonly perim_table = 'geo.perimeters';
  private readonly today = new Date();

  constructor(private pg: PostgresConnection) {}

  async getLocation(params: LocationParamsInterface): Promise<LocationResultInterface> {
    const year = params.end_date.substring(0,4);
    const sql = {
      values:[params.code, params.start_date, params.end_date],  
      text: `
      ${!params.direction || params.direction == 'from' ? 
        `SELECT st_y(start_position::geometry) as lon, 
        st_x(start_position::geometry) as lat 
        FROM ${this.table} 
        WHERE datetime BETWEEN $2 AND $3
        AND status='ok'
        AND is_driver=false
        ${(params.t && params.code) ? 
        `AND (start_geo_code IN (SELECT com FROM (SELECT com,epci,aom,dep,reg,country FROM ${this.perim_table} WHERE year = ${year}) t WHERE ${checkTerritoryParam(params.t)} = $1) 
        OR end_geo_code IN (SELECT com FROM (SELECT com,epci,aom,dep,reg,country FROM ${this.perim_table} WHERE year = ${year}) t WHERE ${checkTerritoryParam(params.t)} = $1))`
        : ''}
        : ''
      }
      ${!params.direction ? 'UNION ALL' : ''}
      ${!params.direction || params.direction == 'to' ? 
        `SELECT st_y(end_position::geometry) as lon, 
        st_x(end_position::geometry) as lat 
        FROM ${this.table} 
        WHERE datetime BETWEEN $2 AND $3
        AND status='ok'
        AND is_driver=false
        ${(params.t && params.code) ? 
        `AND (start_geo_code IN (SELECT com FROM (SELECT com,epci,aom,dep,reg,country FROM ${this.perim_table} WHERE year = ${year}) t WHERE ${checkTerritoryParam(params.t)} = $1) 
        OR end_geo_code IN (SELECT com FROM (SELECT com,epci,aom,dep,reg,country FROM ${this.perim_table} WHERE year = ${year}) t WHERE ${checkTerritoryParam(params.t)} = $1))`
        : ''}
        : ''
      }
      `
    };
    const response: { rowCount: number, rows: LocationResultInterface } = await this.pg.getClient().query(sql);
    return response.rows;
  };

  
}
