import { provider } from '@ilos/common';

import { FraudCheckResult } from '../../../interfaces';

interface Params {
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
export class EndLongitudeCollisionCheck {
  public static readonly key: string = 'endLongitudeCollisionCheck';

  protected readonly maxLon: number = 1; // above = 100
  protected readonly minLon: number = 0.001; // below = 0

  async cursor(params: Params): Promise<FraudCheckResult<Meta>> {
    const { driver_end_lon, passenger_end_lon } = params;

    const delta = Math.abs(passenger_end_lon - driver_end_lon);
    const result = (delta - this.minLon) * (100 / (this.maxLon - this.minLon));

    return {
      meta: {
        delta,
      },
      karma: Math.min(100, Math.max(0, result)),
    };
  }
}
