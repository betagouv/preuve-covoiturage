import { provider } from '@ilos/common';

import { FraudCheckResult, HandleCheckInterface } from '../../../interfaces';
import { SelfCheckParamsInterface } from './SelfCheckParamsInterface';
import { SelfCheckPreparator } from '../SelfCheckPreparator';
import { step } from '../../helpers/math';

/*
 * Check start latitude collision
 */
@provider()
export class StartLatitudeCollisionCheck implements HandleCheckInterface<SelfCheckParamsInterface> {
  public static readonly key: string = 'startLatitudeCollisionCheck';
  public readonly preparer = SelfCheckPreparator;

  protected readonly max: number = 1; // above = 100
  protected readonly min: number = 0.001; // below = 0

  async handle(params: SelfCheckParamsInterface): Promise<FraudCheckResult> {
    const { driver_start_lat, passenger_start_lat } = params;
    return step(Math.abs(passenger_start_lat - driver_start_lat), this.min, this.max);
  }
}
