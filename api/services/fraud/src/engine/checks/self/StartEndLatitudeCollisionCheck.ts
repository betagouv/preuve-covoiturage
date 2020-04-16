import { provider } from '@ilos/common';

import { FraudCheckResult } from '../../../interfaces';

interface Params {
  driver_start_lat: number;
  driver_end_lat: number;
  passenger_start_lat: number;
  passenger_end_lat: number;
}

interface Meta {
  error?: string;
  passenger_delta?: number;
  driver_delta?: number;
}

/*
 * Check start and end latitude collision
 */
@provider()
export class StartEndLatitudeCollisionCheck {
  public static readonly key: string = 'startEndLatitudeCollisionCheck';

  protected readonly maxLat: number = 0.001; // above = 0
  protected readonly minLat: number = 0; // below = 100

  async cursor(params: Params): Promise<FraudCheckResult<Meta>> {
    const { passenger_start_lat, passenger_end_lat, driver_start_lat, driver_end_lat } = params;

    const passengerResult = this.calc(passenger_start_lat, passenger_end_lat);
    const driverResult = this.calc(driver_start_lat, driver_end_lat);

    return {
      meta: {
        passenger_delta: passengerResult.delta,
        driver_delta: driverResult.delta,
      },
      karma: Math.max(passengerResult.karma, driverResult.karma),
    };
  }

  protected calc(start_lat: number, end_lat: number): { delta: number; karma: number } {
    const delta = Math.abs(start_lat - end_lat);
    return {
      delta,
      karma: Math.min(100, Math.max(0, Math.round(100 - (100 / this.maxLat) * delta))),
    }
  }
}
