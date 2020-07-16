import { provider } from '@ilos/common';

import { HandleCheckInterface } from '../../../interfaces';
import { SelfCheckPreparator } from '../SelfCheckPreparator';
import { SelfCheckParamsInterface } from './SelfCheckParamsInterface';
import { step } from '../../helpers/math';
/*
 * Check end latitude collision
 */
@provider()
export class EndLatitudeCollisionCheck implements HandleCheckInterface<SelfCheckParamsInterface> {
  public static readonly key: string = 'endLatitudeCollisionCheck';
  public readonly preparer = SelfCheckPreparator;

  protected readonly max: number = 1; // above = 100
  protected readonly min: number = 0.001; // below = 0

  async handle(params: SelfCheckParamsInterface): Promise<number> {
    const { driver_end_lat, passenger_end_lat } = params;
    return step(Math.abs(passenger_end_lat - driver_end_lat), this.min, this.max);
  }
}
