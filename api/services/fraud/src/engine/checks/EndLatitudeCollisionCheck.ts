import { provider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';

import { AbstractQueryCheck } from '../AbstractQueryCheck';
import { FraudCheckResult } from '../../interfaces';

interface Params {
  acquisition_id: string;
  driver_end_lat: number;
  passenger_end_lat: number;
}

interface Meta {
  error?: string;
  delta?: number;
}

/*
 * Check end latitude collision
 */
@provider()
export class EndLatitudeCollisionCheck extends AbstractQueryCheck<Params, Meta> {
  public static readonly key: string = 'endLatitudeCollisionCheck';

  protected readonly maxLat: number = 1; // above = 100
  protected readonly minLat: number = 0.001; // below = 0

  constructor(connection: PostgresConnection) {
    super(connection);
  }

  public get query(): string {
    return `
    SELECT
      driver.acquisition_id as acquisition_id,
      ST_Y(driver.end_position::geometry) as driver_end_lat,
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
    const { driver_end_lat, passenger_end_lat } = params;

    const delta = Math.abs(passenger_end_lat - driver_end_lat);
    const result = (delta - this.minLat) * (100 / (this.maxLat - this.minLat));

    return {
      meta: {
        delta,
      },
      karma: Math.min(100, Math.max(0, result)),
    };
  }
}
