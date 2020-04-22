import { provider } from '@ilos/common';

import { FraudCheckResult, HandleCheckInterface } from '../../../interfaces';
import { SelfCheckParamsInterface } from './SelfCheckParamsInterface';
import { SelfCheckPreparator } from '../SelfCheckPreparator';
import { step } from '../../helpers/math';

/*
 * Check number of reserved seats
 */
@provider()
export class HighSeatCheck implements HandleCheckInterface<SelfCheckParamsInterface> {
  public static readonly key: string = 'highSeatCheck';
  public readonly preparer = SelfCheckPreparator;

  protected readonly max: number = 8; // above = 100
  protected readonly min: number = 5; // below = 0

  async handle(params: SelfCheckParamsInterface): Promise<FraudCheckResult> {
    const { passenger_seats } = params;
    return step(passenger_seats, this.min, this.max);
  }
}
