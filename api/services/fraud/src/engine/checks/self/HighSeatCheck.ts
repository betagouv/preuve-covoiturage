import { provider } from '@ilos/common';

import { FraudCheckResult, HandleCheckInterface } from '../../../interfaces';
import { SelfCheckParamsInterface } from './SelfCheckParamsInterface';
import { SelfCheckPreparator } from '../SelfCheckPreparator';

/*
 * Check number of reserved seats
 */
@provider()
export class HighSeatCheck implements HandleCheckInterface<SelfCheckParamsInterface> {
  public static readonly key: string = 'highSeatCheck';
  public readonly preparer = SelfCheckPreparator;

  protected readonly maxSeats: number = 8; // above = 100
  protected readonly minSeats: number = 5; // below = 0

  async handle(params: SelfCheckParamsInterface): Promise<FraudCheckResult> {
    const { passenger_seats } = params;
    const result = (passenger_seats - this.minSeats) * (100 / (this.maxSeats - this.minSeats));

    return Math.min(100, Math.max(0, result));
  }
}
