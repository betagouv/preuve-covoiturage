import { provider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';
import { GeoProviderInterfaceResolver } from '@pdc/provider-geo';

import { PrepareCheckInterface } from '../../interfaces';
import { SelfCheckParamsInterface } from './self/SelfCheckParamsInterface';

@provider()
export class SelfCheckPreparator implements PrepareCheckInterface<SelfCheckParamsInterface> {
  public carpoolView = 'carpool.carpools'; // TODO : change target to view
  protected datasource = 'data';

  constructor(private connection: PostgresConnection, private geoProvider: GeoProviderInterfaceResolver) {}

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
    const results = [];
    for (const line of dbResult.rows) {
      const { driver_meta, passenger_meta, ...data } = line;

      let { calc_distance: driver_calc_distance, calc_duration: driver_calc_duration } = driver_meta;
      if (!driver_calc_distance || !driver_calc_duration) {
        ({ distance: driver_calc_distance, duration: driver_calc_duration } = await this.calcDistanceAndDuration(
          line.driver_start_lat,
          line.driver_start_lon,
          line.driver_end_lat,
          line.driver_end_lon,
        ));
      }

      let { calc_distance: passenger_calc_distance, calc_duration: passenger_calc_duration } = passenger_meta;
      if (!passenger_calc_distance || !passenger_calc_duration) {
        ({ distance: passenger_calc_distance, duration: passenger_calc_duration } = await this.calcDistanceAndDuration(
          line.passenger_start_lat,
          line.passenger_start_lon,
          line.passenger_end_lat,
          line.passenger_end_lon,
        ));
      }

      results.push({
        ...data,
        driver_calc_distance,
        driver_calc_duration,
        passenger_calc_distance,
        passenger_calc_duration,
      });
    }

    return results;
  }

  protected async calcDistanceAndDuration(
    start_lat: number,
    start_lon: number,
    end_lat: number,
    end_lon: number,
  ): Promise<{ distance: number; duration: number }> {
    try {
      return await this.geoProvider.getRouteMeta(
        {
          lon: start_lon,
          lat: start_lat,
        },
        {
          lon: end_lon,
          lat: end_lat,
        },
      );
    } catch (e) {
      console.log(e);
      return { distance: 0, duration: 0 };
    }
  }
}
