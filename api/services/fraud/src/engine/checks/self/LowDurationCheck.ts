import { provider } from '@ilos/common';

import { SelfCheckPreparator } from '../SelfCheckPreparator';
import { FraudCheckResult, HandleCheckInterface } from '../../../interfaces';
import { SelfCheckParamsInterface } from './SelfCheckParamsInterface';
import { step } from '../../helpers/math';

/*
 * Check duration
 */
@provider()
export class LowDurationCheck implements HandleCheckInterface<SelfCheckParamsInterface> {
  public static readonly key: string = 'lowDurationCheck';
  public readonly preparer = SelfCheckPreparator;

  protected readonly max: number = 300; // above = 0
  protected readonly min: number = 1; // below = 100

  async handle(params: SelfCheckParamsInterface): Promise<FraudCheckResult> {
    const { driver_duration, passenger_duration } = params;
    return Math.max(this.calc(driver_duration), this.calc(passenger_duration));
  }

  protected calc(duration: number): number {
    return 1 - step(duration, this.min, this.max);
  }
}
