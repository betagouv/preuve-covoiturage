import { provider } from '@ilos/common';

import { FraudCheckResult, HandleCheckInterface } from '../../../interfaces';
import { SelfCheckParamsInterface } from './SelfCheckParamsInterface';
import { SelfCheckPreparator } from '../SelfCheckPreparator';
import { limit } from '../../helpers/math';

/*
 * Check theorical distance and duration
 */
@provider()
export class TheoricalDistanceAndDurationCheck implements HandleCheckInterface<SelfCheckParamsInterface> {
  public static readonly key: string = 'theoricalDistanceAndDurationCheck';
  public readonly preparer = SelfCheckPreparator;

  constructor() {}

  async handle(params: SelfCheckParamsInterface): Promise<FraudCheckResult> {
    const {
      driver_distance,
      driver_duration,
      driver_calc_distance,
      driver_calc_duration,
      passenger_distance,
      passenger_duration,
      passenger_calc_distance,
      passenger_calc_duration,
    } = params;

    const driver_distance_karma = this.calc(driver_distance, driver_calc_distance);
    const driver_duration_karma = this.calc(driver_duration, driver_calc_duration);
    const passenger_distance_karma = this.calc(passenger_distance, passenger_calc_distance);
    const passenger_duration_karma = this.calc(passenger_duration, passenger_calc_duration);

    return Math.max(driver_distance_karma, driver_duration_karma, passenger_distance_karma, passenger_duration_karma);
  }

  protected calc(theorical: number, announced: number): number {
    if (announced === 0 || theorical === 0) {
      return 1;
    }

    return limit(Math.abs(theorical - announced) / theorical, 0, 1);
  }
}
