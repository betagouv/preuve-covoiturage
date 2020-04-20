import { provider } from '@ilos/common';

import { FraudCheckResult, HandleCheckInterface } from '../../../interfaces';
import { SelfCheckPreparator } from '../SelfCheckPreparator';
import { SelfCheckParamsInterface } from './SelfCheckParamsInterface';

/*
 * Check start and end latitude collision
 */
@provider()
export class StartEndLatitudeCollisionCheck implements HandleCheckInterface<SelfCheckParamsInterface> {
  public static readonly key: string = 'startEndLatitudeCollisionCheck';
  public readonly preparer = SelfCheckPreparator;

  protected readonly maxLat: number = 0.001; // above = 0
  protected readonly minLat: number = 0; // below = 100

  async handle(params: SelfCheckParamsInterface): Promise<FraudCheckResult> {
    const { passenger_start_lat, passenger_end_lat, driver_start_lat, driver_end_lat } = params;

    const passengerResult = this.calc(passenger_start_lat, passenger_end_lat);
    const driverResult = this.calc(driver_start_lat, driver_end_lat);

    return Math.max(passengerResult.karma, driverResult.karma);
  }

  protected calc(start_lat: number, end_lat: number): { delta: number; karma: number } {
    const delta = Math.abs(start_lat - end_lat);
    return {
      delta,
      karma: Math.min(100, Math.max(0, Math.round(100 - (100 / this.maxLat) * delta))),
    };
  }
}
