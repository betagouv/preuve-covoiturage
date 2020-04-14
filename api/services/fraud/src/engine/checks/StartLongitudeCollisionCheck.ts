import { provider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';

import { AbstractQueryCheck } from '../AbstractQueryCheck';
import { FraudCheckResult } from '../../interfaces';

interface Params {
  acquisition_id: number;
  driver_start_lon: number;
  passenger_start_lon: number;
}

interface Meta {
  error?: string;
  delta?: number;
}

/*
 * Check start longitude collision
 */
@provider()
export class StartLongitudeCollisionCheck extends AbstractQueryCheck<Params, Meta> {
  public static readonly key: string = 'startLongitudeCollisionCheck';

  protected readonly maxLon: number = 1; // above = 100
  protected readonly minLon: number = 0.001; // below = 0

  constructor(connection: PostgresConnection) {
    super(connection);
  }

  public get query(): string {
    return `
    SELECT
      driver.acquisition_id as acquisition_id,
      ST_X(driver.start_position::geometry) as driver_start_lon,
      ST_X(passenger.start_position::geometry) as passenger_start_lon
    FROM ${this.carpoolView} as driver
    LEFT JOIN ${this.carpoolView} as passenger
      ON driver.acquisition_id = passenger.acquisition_id
      AND passenger.is_driver = false
    WHERE
      driver.is_driver = true
    `;
  }

  async cursor(params: Params): Promise<FraudCheckResult<Meta>> {
    const { driver_start_lon, passenger_start_lon } = params;

    const delta = Math.abs(passenger_start_lon - driver_start_lon);
    const result = (delta - this.minLon) * (100 / (this.maxLon - this.minLon));

    return {
      meta: {
        delta,
      },
      karma: Math.min(100, Math.max(0, result)),
    };
  }
}
