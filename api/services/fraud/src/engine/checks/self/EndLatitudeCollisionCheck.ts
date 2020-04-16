import { provider } from '@ilos/common';

import { FraudCheckResult, HandleCheckInterface, PrepareCheckInterface } from '../../../interfaces';
import { SelfCheckPreparator } from '../SelfCheckPreparator';
import { SelfCheckParamsInterface } from './SelfCheckParamsInterface';

/*
 * Check end latitude collision
 */
@provider()
export class EndLatitudeCollisionCheck implements HandleCheckInterface<SelfCheckParamsInterface> {
  public static readonly key: string = 'endLatitudeCollisionCheck';
  public readonly preparer = SelfCheckPreparator;
  
  protected readonly maxLat: number = 1; // above = 100
  protected readonly minLat: number = 0.001; // below = 0

  async handle(params: SelfCheckParamsInterface): Promise<number> {
    const { driver_end_lat, passenger_end_lat } = params;

    const delta = Math.abs(passenger_end_lat - driver_end_lat);
    const result = (delta - this.minLat) * (100 / (this.maxLat - this.minLat));

    return Math.min(100, Math.max(0, result));
  }
}
