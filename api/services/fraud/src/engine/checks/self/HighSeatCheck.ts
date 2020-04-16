import { provider } from '@ilos/common';

import { FraudCheckResult } from '../../../interfaces';

interface Params {
  passenger_seats: number;
}

interface Meta {
  error?: string;
  passenger_seats?: number;
}

/*
 * Check number of reserved seats
 */
@provider()
export class HighSeatCheck {
  public static readonly key: string = 'highSeatCheck';

  protected readonly maxSeats: number = 8; // above = 100
  protected readonly minSeats: number = 5; // below = 0

  async cursor(params: Params): Promise<FraudCheckResult<Meta>> {
    const { passenger_seats } = params;
    const result = (passenger_seats - this.minSeats) * (100 / (this.maxSeats - this.minSeats));

    return {
      meta: {
        passenger_seats,
      },
      karma: Math.min(100, Math.max(0, result)),
    };
  }
}
