import { provider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';

import { AbstractQueryCheck } from '../AbstractQueryCheck';
import { FraudCheckResult } from '../../interfaces';

interface Params {
  acquisition_id: string;
  driver_start_lat: number;
  driver_end_lat: number;
  passenger_start_lat: number;
  passenger_end_lat: number;
}

interface Meta {
  error?: string;
}

/*
 * Check start and end latitude collision
 */
@provider()
export class StartEndLatitudeCollisionCheck extends AbstractQueryCheck<Params,Meta> {
  public static readonly key: string = 'startEndLatitudeCollisionCheck';

  protected readonly maxLat: number = 0.001; // above = 0
  protected readonly minLat: number = 0; // below = 100

  constructor(
    connection: PostgresConnection,
  ) {
    super(connection);
  }

  public get query(): string {
    return `
    SELECT
      driver.acquisition_id as acquisition_id,
      ST_Y(driver.start_position::geometry) as driver_start_lat,
      ST_Y(driver.end_position::geometry) as driver_end_lat,
      ST_Y(passenger.start_position::geometry) as passenger_start_lat,
      ST_Y(passenger.end_position::geometry) as passenger_end_lat
    FROM ${this.carpoolView} as driver
    LEFT JOIN ${this.carpoolView} as passenger
      ON driver.acquisition_id = passenger.acquisition_id
      AND passenger.is_driver = false
    WHERE
      driver.is_driver = true
    `;
  }

  async cursor(params: Params): Promise<FraudCheckResult<Meta>> {
    const {
      driver_start_lat,
      driver_end_lat,
      passenger_start_lat,
      passenger_end_lat,
    } = params;

    const driverResult = (100 - (100 / this.maxLat * (driver_start_lat - driver_end_lat)));
    const passengerResult = (100 - (100 / this.maxLat * (passenger_start_lat - passenger_end_lat)));

    return {
      meta: {},
      karma: Math.min(100, Math.max(0, Math.round((driverResult + passengerResult) / 2 ))),
    };
  }
}
