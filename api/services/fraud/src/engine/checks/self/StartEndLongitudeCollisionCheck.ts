import { provider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';

import { AbstractQueryCheck } from '../../AbstractQueryCheck';
import { FraudCheckResult } from '../../../interfaces';

interface Params {
  driver_start_lon: number;
  driver_end_lon: number;
  passenger_start_lon: number;
  passenger_end_lon: number;
}

interface Meta {
  error?: string;
  driver_delta?: number;
  passenger_delta?: number;
}

/*
 * Check start and end longitude collision
 */
@provider()
export class StartEndLongitudeCollisionCheck {
  public static readonly key: string = 'startEndLongitudeCollisionCheck';

  protected readonly maxLon: number = 0.001; // above = 0
  protected readonly minLon: number = 0; // below = 100

  async cursor(params: Params): Promise<FraudCheckResult<Meta>> {
    const { passenger_start_lon, passenger_end_lon, driver_start_lon, driver_end_lon } = params;

    const passengerResult = this.calc(passenger_start_lon, passenger_end_lon);
    const driverResult = this.calc(driver_start_lon, driver_end_lon);

    return {
      meta: {
        passenger_delta: passengerResult.delta,
        driver_delta: driverResult.delta,
      },
      karma: Math.max(passengerResult.karma, driverResult.karma),
    };
  }

  protected calc(start_lon: number, end_lon: number): { delta: number; karma: number } {
    const delta = Math.abs(start_lon - end_lon);
    return {
      delta,
      karma: Math.min(100, Math.max(0, Math.round(100 - (100 / this.maxLon) * delta))),
    }
  }
}
