import { provider } from '@ilos/common';

import { FraudCheckResult, HandleCheckInterface } from '../../../interfaces';
import { SelfCheckParamsInterface } from './SelfCheckParamsInterface';
import { SelfCheckPreparator } from '../SelfCheckPreparator';

/*
 * Check start latitude collision
 */
@provider()
export class StartLatitudeCollisionCheck implements HandleCheckInterface<SelfCheckParamsInterface> {
  public static readonly key: string = 'startLatitudeCollisionCheck';
  public readonly preparer = SelfCheckPreparator;

  protected readonly maxLat: number = 1; // above = 100
  protected readonly minLat: number = 0.001; // below = 0

  async handle(params: SelfCheckParamsInterface): Promise<FraudCheckResult> {
    const { driver_start_lat, passenger_start_lat } = params;

    const delta = Math.abs(passenger_start_lat - driver_start_lat);
    const result = (delta - this.minLat) * (100 / (this.maxLat - this.minLat));
    return Math.min(100, Math.max(0, result));
  }
}
