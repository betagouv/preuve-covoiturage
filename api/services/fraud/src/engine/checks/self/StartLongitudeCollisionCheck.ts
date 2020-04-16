import { provider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';

import { AbstractQueryCheck } from '../../AbstractQueryCheck';
import { FraudCheckResult } from '../../../interfaces';

interface Params {
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
export class StartLongitudeCollisionCheck {
  public static readonly key: string = 'startLongitudeCollisionCheck';

  protected readonly maxLon: number = 1; // above = 100
  protected readonly minLon: number = 0.001; // below = 0

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
