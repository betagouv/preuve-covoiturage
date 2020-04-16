import { provider } from '@ilos/common';

import { FraudCheckResult, HandleCheckInterface } from '../../../interfaces';
import { SelfCheckParamsInterface } from './SelfCheckParamsInterface';
import { SelfCheckPreparator } from '../SelfCheckPreparator';

/*
 * Check start longitude collision
 */
@provider()
export class StartLongitudeCollisionCheck implements HandleCheckInterface<SelfCheckParamsInterface> {
  public static readonly key: string = 'startLongitudeCollisionCheck';
  public readonly preparer = SelfCheckPreparator;

  protected readonly maxLon: number = 1; // above = 100
  protected readonly minLon: number = 0.001; // below = 0

  async handle(params: SelfCheckParamsInterface): Promise<FraudCheckResult> {
    const { driver_start_lon, passenger_start_lon } = params;

    const delta = Math.abs(passenger_start_lon - driver_start_lon);
    const result = (delta - this.minLon) * (100 / (this.maxLon - this.minLon));

    return Math.min(100, Math.max(0, result));
  }
}
