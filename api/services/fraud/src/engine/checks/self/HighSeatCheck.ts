import { provider } from '@ilos/common';

import { CheckHandleCallback, HandleCheckInterface } from '../../../interfaces';
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

  protected readonly max: number = 7; // above = 100
  protected readonly min: number = 4; // below = 0

  async handle(params: SelfCheckParamsInterface, cb: CheckHandleCallback): Promise<void> {
    const { passenger_seats } = params;
    cb(step(passenger_seats, this.min, this.max));
  }
}
