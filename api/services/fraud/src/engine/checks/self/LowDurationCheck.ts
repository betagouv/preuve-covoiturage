import { provider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';

import { AbstractQueryCheck } from '../../AbstractQueryCheck';
import { FraudCheckResult } from '../../../interfaces';

interface Params {
  driver_duration: number;
  passenger_duration: number;
}

interface Meta {
  error?: string;
  driver_duration?: number;
  passenger_duration?: number;
}

/*
 * Check duration
 */
@provider()
export class LowDurationCheck {
  public static readonly key: string = 'lowDurationCheck';

  protected readonly maxDuration: number = 300; // above = 0
  protected readonly minDuration: number = 0; // below = 100

  async cursor(params: Params): Promise<FraudCheckResult<Meta>> {
    const { driver_duration, passenger_duration } = params;
    return {
      meta: {
        driver_duration,
        passenger_duration,
      },
      karma: Math.max(this.calc(driver_duration), this.calc(passenger_duration)),
    };
  }

  protected calc(duration: number): number {
    const step = 100 / (this.maxDuration - this.minDuration);
    return Math.min(100, Math.max(0, step * (this.maxDuration - duration)));
  }
}
