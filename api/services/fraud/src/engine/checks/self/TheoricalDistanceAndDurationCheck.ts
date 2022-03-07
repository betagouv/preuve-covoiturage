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
      driver_start_geo_code,
      driver_end_geo_code,
      passenger_distance,
      passenger_duration,
      passenger_calc_distance,
      passenger_calc_duration,
      passenger_start_geo_code,
      passenger_end_geo_code,
    } = params;
    // Disable this check if insee geo code is in COM (insee 97/98*)
    if (
      [driver_start_geo_code, driver_end_geo_code, passenger_start_geo_code, passenger_end_geo_code].filter(
        (code) => code && (code.startsWith('97') || code.startsWith('98')),
      ).length
    ) {
      return 0;
    }

    const driver_distance_karma = this.calc(driver_distance, driver_calc_distance);
    const driver_duration_karma = this.calc(driver_duration, driver_calc_duration);
    const passenger_distance_karma = this.calc(passenger_distance, passenger_calc_distance);
    const passenger_duration_karma = this.calc(passenger_duration, passenger_calc_duration);

    return Math.max(driver_distance_karma, driver_duration_karma, passenger_distance_karma, passenger_duration_karma);
  }

  protected calc(announced: number, theorical: number): number {
    if (theorical === 0) {
      return 1;
    }
    if (!announced) {
      return 0.5;
    }

    return limit(Math.abs(announced - theorical) / announced, 0, 1);
  }
}
