import { PostgresConnection } from '@ilos/connection-postgres';

import { FraudCheckResult, DefaultMetaInterface } from '../interfaces/FraudCheck';
import { AbstractCheck } from './AbstractCheck';

export abstract class AbstractQueryCheck<
  P = any,
  R extends DefaultMetaInterface = DefaultMetaInterface
> extends AbstractCheck<R> {
  public static readonly key: string;
  public carpoolView = 'carpool.carpools'; // TODO : change target to view
  protected datasource = 'data';

  abstract readonly query: string;

  constructor(private connection: PostgresConnection) {
    super();
  }

  async handle(acquisitionId: number, initialMeta?: R | R[]): Promise<FraudCheckResult<R | R[]>> {
    const query = {
      text: `
        SELECT
          driver.acquisition_id as acquisition_id,
          passenger.seats AS passenger_seats,
          ST_Y(driver.start_position::geometry) AS driver_start_lat,
          ST_X(driver.start_position::geometry) AS driver_start_lon,
          ST_y(driver.end_position::geometry) AS driver_end_lat,
          ST_X(driver.end_position::geometry) AS driver_end_lon,
          ST_Y(passenger.start_position::geometry) AS passenger_start_lat,
          ST_X(passenger.start_position::geometry) AS passenger_start_lon,
          ST_Y(passenger.end_position::geometry) AS passenger_end_lat,
          ST_X(passenger.end_position::geometry) AS passenger_end_lon,
          driver.duration AS driver_duration,
          passenger.duration AS passenger_duration,
          driver.distance AS driver_distance,
          passenger.distance AS passenger_distance,
          driver.meta AS driver_meta,
          passenger.meta AS passenger_meta,
        FROM ${this.carpoolView} AS driver 
        LEFT JOIN ${this.carpoolView} AS passenger
          ON 
            driver.acquisition_id = passenger.acquisition_id
            AND passenger.is_driver = false
        WHERE 
          driver.is_driver = true
          AND acquisition_id = $1::int
      `,
      values: [acquisitionId],
    };
    
    const dbResult = await this.connection.getClient().query(query);
    const acquisitionInput = dbResult.rows.map((r) => {
      const { driver_meta, passenger_meta, ...data } = r;
      return {
        ...data,
        driver_calc_distance: driver_meta.calc_distance,
        driver_calc_duration: driver_meta.calc_duration,
        passenger_calc_distance: passenger_meta.calc_distance || 0,
        passenger_calc_duration: passenger_meta.calc_duration || 0,
      }
    });

    const result: FraudCheckResult<R | R[]> = {
      karma: 0,
      meta: null,
    };

    for (const row of dbResult.rows) {
      const { karma, meta } = await this.cursor(row, initialMeta);
      result.karma += karma;

      if (result.meta === null) {
        result.meta = meta;
      } else {
        if (!Array.isArray(result.meta)) {
          result.meta = [result.meta];
        }
        result.meta.push(meta);
      }
    }

    result.karma = Math.round(result.karma / dbResult.rowCount);
    return result;
  }

  abstract async cursor(params: P, meta?: R | R[]): Promise<FraudCheckResult<R>>;
}
