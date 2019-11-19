import { provider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';

import { AbstractQueryCheck } from '../AbstractQueryCheck';
import { FraudCheckResult } from '../../interfaces';

interface Params {
  acquisition_id: string;
  driver_end_lon: number;
  passenger_end_lon: number;
}

interface Meta {
  error?: string;
  delta?: number;
}

/*
 * Check end longitude collision
 */
@provider()
export class EndLongitudeCollisionCheck extends AbstractQueryCheck<Params,Meta> {
  public static readonly key: string = 'endLongitudeCollisionCheck';

  protected readonly maxLon: number = 1; // above = 100
  protected readonly minLon: number = 0.001; // below = 0

  constructor(
    connection: PostgresConnection,
  ) {
    super(connection);
  }

  public get query(): string {
    return `
    SELECT
      driver.acquisition_id as acquisition_id,
      ST_X(driver.end_position::geometry) as driver_end_lon,
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
      driver_end_lon,
      passenger_end_lon,
    } = params;

    const delta = Math.abs((passenger_end_lon - driver_end_lon));
    const result = (delta - this.minLon) * (100 / (this.maxLon - this.minLon));

    return {
      meta: {
        delta,
      },
      karma: Math.min(100, Math.max(0, result)),
    };
  }
}
