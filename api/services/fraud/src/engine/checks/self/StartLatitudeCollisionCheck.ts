import { provider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';

import { AbstractQueryCheck } from '../../AbstractQueryCheck';
import { FraudCheckResult } from '../../../interfaces';

interface Params {
  driver_start_lat: number;
  passenger_start_lat: number;
}

interface Meta {
  error?: string;
  delta?: number;
}

/*
 * Check start latitude collision
 */
@provider()
export class StartLatitudeCollisionCheck {
  public static readonly key: string = 'startLatitudeCollisionCheck';

  protected readonly maxLat: number = 1; // above = 100
  protected readonly minLat: number = 0.001; // below = 0

  async cursor(params: Params): Promise<FraudCheckResult<Meta>> {
    const { driver_start_lat, passenger_start_lat } = params;

    const delta = Math.abs(passenger_start_lat - driver_start_lat);
    const result = (delta - this.minLat) * (100 / (this.maxLat - this.minLat));
    return {
      meta: {
        delta,
      },
      karma: Math.min(100, Math.max(0, result)),
    };
  }
}
