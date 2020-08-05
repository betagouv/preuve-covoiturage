import { provider } from '@ilos/common';

import { FraudCheckResult, HandleCheckInterface } from '../../../interfaces';
import { SelfCheckParamsInterface } from './SelfCheckParamsInterface';
import { SelfCheckPreparator } from '../SelfCheckPreparator';
import { step } from '../../helpers/math';

/*
 * Check start and end longitude collision
 */
@provider()
export class StartEndLongitudeCollisionCheck implements HandleCheckInterface<SelfCheckParamsInterface> {
  public static readonly key: string = 'startEndLongitudeCollisionCheck';
  public readonly preparer = SelfCheckPreparator;

  protected readonly max: number = 0.001; // above = 0
  protected readonly min: number = 0; // below = 100

  async handle(params: SelfCheckParamsInterface): Promise<FraudCheckResult> {
    const { passenger_start_lon, passenger_end_lon, driver_start_lon, driver_end_lon } = params;

    const passengerResult = this.calc(passenger_start_lon, passenger_end_lon);
    const driverResult = this.calc(driver_start_lon, driver_end_lon);

    return Math.max(passengerResult, driverResult);
  }

  protected calc(start_lon: number, end_lon: number): number {
    return 1 - step(Math.abs(start_lon - end_lon), this.min, this.max);
  }
}
