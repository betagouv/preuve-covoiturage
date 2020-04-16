import { provider } from '@ilos/common';

import { FraudCheckResult } from '../../../interfaces';

interface Params {
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
export class EndLatitudeCollisionCheck {
  public static readonly key: string = 'endLatitudeCollisionCheck';

  protected readonly maxLat: number = 1; // above = 100
  protected readonly minLat: number = 0.001; // below = 0

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
