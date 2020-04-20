import { provider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';

import { PrepareCheckInterface, FraudCheckResult } from '../../interfaces';
import { SelfCheckParamsInterface } from './self/SelfCheckParamsInterface';

@provider()
export class SelfCheckPreparator implements PrepareCheckInterface {
  public carpoolView = 'carpool.carpools'; // TODO : change target to view
  protected datasource = 'data';

  constructor(private connection: PostgresConnection) {
  }

  async prepare(acquisitionId: number): Promise<SelfCheckParamsInterface[]> {
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
          passenger.meta AS passenger_meta
        FROM ${this.carpoolView} AS driver 
        LEFT JOIN ${this.carpoolView} AS passenger
          ON 
            driver.acquisition_id = passenger.acquisition_id
            AND passenger.is_driver = false
        WHERE 
          driver.is_driver = true
          AND driver.acquisition_id = $1::int
      `,
      values: [acquisitionId],
    };
    
    const dbResult = await this.connection.getClient().query(query);
    return dbResult.rows.map((r) => {
      const { driver_meta, passenger_meta, ...data } = r;
      return {
        ...data,
        driver_calc_distance: driver_meta.calc_distance,
        driver_calc_duration: driver_meta.calc_duration,
        passenger_calc_distance: passenger_meta.calc_distance || 0,
        passenger_calc_duration: passenger_meta.calc_duration || 0,
      }
    });
  }
}
