import { provider } from '@ilos/common';

import { FraudCheckResult } from '../../../interfaces';

interface Params {
  driver_duration: number;
  passenger_duration: number;
}

interface Meta {
  driver_duration?: number;
  passenger_duration?: number;
  error?: string;
}

/*
 * Check duration
 */
@provider()
export class HighDurationCheck {
  public static readonly key: string = 'highDurationCheck';

  protected readonly maxDuration: number = 43200; // above = 100
  protected readonly minDuration: number = 7200; // below = 0

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
    return Math.min(100, Math.max(0, step * (duration - this.minDuration)));
  }
}
