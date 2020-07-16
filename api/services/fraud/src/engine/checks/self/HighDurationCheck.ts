import { provider } from '@ilos/common';

import { FraudCheckResult, HandleCheckInterface } from '../../../interfaces';
import { SelfCheckParamsInterface } from './SelfCheckParamsInterface';
import { SelfCheckPreparator } from '../SelfCheckPreparator';
import { step } from '../../helpers/math';

/*
 * Check duration
 */
@provider()
export class HighDurationCheck implements HandleCheckInterface<SelfCheckParamsInterface> {
  public static readonly key: string = 'highDurationCheck';
  public readonly preparer = SelfCheckPreparator;

  protected readonly max: number = 28800; // above = 100
  protected readonly min: number = 5400; // below = 0

  async handle(params: SelfCheckParamsInterface): Promise<FraudCheckResult> {
    const { driver_duration, passenger_duration } = params;
    return Math.max(this.calc(driver_duration), this.calc(passenger_duration));
  }

  protected calc(duration: number): number {
    return step(duration, this.min, this.max);
  }
}
