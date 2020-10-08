import { provider } from '@ilos/common';

import { FraudCheckResult, HandleCheckInterface } from '../../../interfaces';
import { SelfCheckParamsInterface } from './SelfCheckParamsInterface';
import { SelfCheckPreparator } from '../SelfCheckPreparator';
import { step } from '../../helpers/math';

/*
 * Check end longitude collision
 */
@provider()
export class EndLongitudeCollisionCheck implements HandleCheckInterface<SelfCheckParamsInterface> {
  public static readonly key: string = 'endLongitudeCollisionCheck';
  public readonly preparer = SelfCheckPreparator;

  protected readonly max: number = 1; // above = 100
  protected readonly min: number = 0.001; // below = 0

  async handle(params: SelfCheckParamsInterface): Promise<FraudCheckResult> {
    const { driver_end_lon, passenger_end_lon } = params;
    return step(Math.abs(passenger_end_lon - driver_end_lon), this.min, this.max);
  }
}
