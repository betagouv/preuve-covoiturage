import { provider } from '@ilos/common';

import { SelfCheckPreparator } from '../SelfCheckPreparator';
import { FraudCheckResult, HandleCheckInterface } from '../../../interfaces';
import { SelfCheckParamsInterface } from './SelfCheckParamsInterface';

/*
 * Check duration
 */
@provider()
export class LowDurationCheck implements HandleCheckInterface<SelfCheckParamsInterface> {
  public static readonly key: string = 'lowDurationCheck';
  public readonly preparer = SelfCheckPreparator;

  protected readonly maxDuration: number = 300; // above = 0
  protected readonly minDuration: number = 0; // below = 100

  async handle(params: SelfCheckParamsInterface): Promise<FraudCheckResult> {
    const { driver_duration, passenger_duration } = params;
    return Math.max(this.calc(driver_duration), this.calc(passenger_duration));
  }

  protected calc(duration: number): number {
    const step = 100 / (this.maxDuration - this.minDuration);
    return Math.min(100, Math.max(0, step * (this.maxDuration - duration)));
  }
}
