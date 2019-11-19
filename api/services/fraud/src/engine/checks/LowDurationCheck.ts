import { provider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';

import { AbstractQueryCheck } from '../AbstractQueryCheck';
import { FraudCheckResult } from '../../interfaces';

interface Params {
  acquisition_id: string;
  duration: number;
}

interface Meta {
  error?: string;
  duration?: number;
}

/*
 * Check duration
 */
@provider()
export class LowDurationCheck extends AbstractQueryCheck<Params, Meta> {
  public static readonly key: string = 'lowDurationCheck';

  protected readonly maxDuration: number = 300; // above = 0
  protected readonly minDuration: number = 0; // below = 100

  constructor(connection: PostgresConnection) {
    super(connection);
  }

  public get query(): string {
    return `
      SELECT
        acquisition_id,
        duration
      FROM ${this.carpoolView}
    `;
  }

  async cursor(params: Params): Promise<FraudCheckResult<Meta>> {
    const { duration } = params;
    return {
      meta: {
        duration,
      },
      karma: this.calc(duration),
    };
  }

  protected calc(duration: number): number {
    const step = 100 / (this.maxDuration - this.minDuration);
    return Math.min(100, Math.max(0, step * (this.maxDuration - duration)));
  }
}
