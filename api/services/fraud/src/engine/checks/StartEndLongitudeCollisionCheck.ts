import { provider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';

import { AbstractQueryCheck } from '../AbstractQueryCheck';
import { FraudCheckResult } from '../../interfaces';

interface Params {
  acquisition_id: string;
  driver_start_lon: number;
  driver_end_lon: number;
  passenger_start_lon: number;
  passenger_end_lon: number;
}

interface Meta {
  error?: string;
}

/*
 * Check start and end longitude collision
 */
@provider()
export class StartEndLongitudeCollisionCheck extends AbstractQueryCheck<Params,Meta> {
  public static readonly key: string = 'startEndLongitudeCollisionCheck';

  protected readonly maxLon: number = 0.001; // above = 0
  protected readonly minLon: number = 0; // below = 100

  constructor(
    connection: PostgresConnection,
  ) {
    super(connection);
  }

  public get query(): string {
    return `
    SELECT
      driver.acquisition_id as acquisition_id,
      ST_X(driver.start_position::geometry) as driver_start_lon,
      ST_X(driver.end_position::geometry) as driver_end_lon,
      ST_X(passenger.start_position::geometry) as passenger_start_lon,
      ST_X(passenger.end_position::geometry) as passenger_end_lon
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
      driver_start_lon,
      driver_end_lon,
      passenger_start_lon,
      passenger_end_lon,
    } = params;

    const driverResult = (100 - (100 / this.maxLon * (driver_start_lon - driver_end_lon)));
    const passengerResult = (100 - (100 / this.maxLon * (passenger_start_lon - passenger_end_lon)));

    return {
      meta: {},
      karma: Math.min(100, Math.max(0, Math.round((driverResult + passengerResult) / 2 ))),
    };
  }
}
