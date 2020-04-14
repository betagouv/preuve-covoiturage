import { provider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';

import { AbstractQueryCheck } from '../AbstractQueryCheck';
import { FraudCheckResult } from '../../interfaces';

interface Params {
  acquisition_id: number;
  seats: number;
}

interface Meta {
  error?: string;
  seats?: number;
}

/*
 * Check number of reserved seats
 */
@provider()
export class HighSeatCheck extends AbstractQueryCheck<Params, Meta> {
  public static readonly key: string = 'highSeatCheck';

  protected readonly maxSeats: number = 8; // above = 100
  protected readonly minSeats: number = 5; // below = 0

  constructor(connection: PostgresConnection) {
    super(connection);
  }

  public get query(): string {
    return `
      SELECT
        acquisition_id,
        seats
      FROM ${this.carpoolView}
      WHERE
        is_driver = false
    `;
  }

  async cursor(params: Params): Promise<FraudCheckResult<Meta>> {
    const { seats } = params;
    const result = (seats - this.minSeats) * (100 / (this.maxSeats - this.minSeats));

    return {
      meta: {
        seats,
      },
      karma: Math.min(100, Math.max(0, result)),
    };
  }
}
