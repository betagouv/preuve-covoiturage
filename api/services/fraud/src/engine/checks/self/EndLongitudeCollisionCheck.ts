import { provider } from '@ilos/common';

import { FraudCheckResult, HandleCheckInterface } from '../../../interfaces';
import { SelfCheckParamsInterface } from './SelfCheckParamsInterface';
import { SelfCheckPreparator } from '../SelfCheckPreparator';

/*
 * Check end longitude collision
 */
@provider()
export class EndLongitudeCollisionCheck implements HandleCheckInterface<SelfCheckParamsInterface>{
  public static readonly key: string = 'endLongitudeCollisionCheck';
  public readonly preparer = SelfCheckPreparator;

  protected readonly maxLon: number = 1; // above = 100
  protected readonly minLon: number = 0.001; // below = 0

  async handle(params: SelfCheckParamsInterface): Promise<FraudCheckResult> {
    const { driver_end_lon, passenger_end_lon } = params;

    const delta = Math.abs(passenger_end_lon - driver_end_lon);
    const result = (delta - this.minLon) * (100 / (this.maxLon - this.minLon));

    return Math.min(100, Math.max(0, result));
  }
}
