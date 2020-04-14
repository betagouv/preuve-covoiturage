import { provider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';

import { AbstractQueryCheck } from '../AbstractQueryCheck';
import { FraudCheckResult } from '../../interfaces';

interface Params {
  acquisition_id: number;
  duration: number;
}

interface Meta {
  duration?: number;
  error?: string;
}

/*
 * Check duration
 */
@provider()
export class HighDurationCheck extends AbstractQueryCheck<Params, Meta> {
  public static readonly key: string = 'highDurationCheck';

  protected readonly maxDuration: number = 43200; // above = 100
  protected readonly minDuration: number = 7200; // below = 0

  constructor(connection: PostgresConnection) {
    super(connection);
  }

  public get query(): string {
    return `
      SELECT
        acquisition_id,
        duration
      FROM ${this.datasource}
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
    return Math.min(100, Math.max(0, step * (duration - this.minDuration)));
  }
}
