import { provider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';

import { AbstractQueryCheck } from '../AbstractQueryCheck';
import { FraudCheckResult } from '../../interfaces';

interface Params {
  acquisition_id: string;
  driver_duration: number;
  passenger_duration: number;
}

interface Meta {
  error?: string;
}

/*
 * Check duration
 */
@provider()
export class HighDurationCheck extends AbstractQueryCheck<Params,Meta> {
  public static readonly key: string = 'highDurationCheck';

  protected readonly maxDuration: number = 43200; // above = 100
  protected readonly minDuration: number = 7200; // below = 0

  constructor(
    connection: PostgresConnection,
  ) {
    super(connection);
  }

  public get query(): string {
    return `
      SELECT
        driver.acquisition_id as acquisition_id,
        driver.duration as driver_duration,
        passenger.duration as passenger_duration
      FROM ${this.carpoolView} as driver
      LEFT JOIN ${this.carpoolView} as passenger
        ON driver.acquisition_id = passenger.acquisition_id
        AND passenger.is_driver = false
      WHERE
        driver.is_driver = true
    `;
  }

  async cursor(params: Params): Promise<FraudCheckResult<Meta>> {
    const { driver_duration, passenger_duration } = params;
    return {
      meta: {},
      karma: Math.round(
        (this.calc(driver_duration) + this.calc(passenger_duration)) / 2
      ),
    };
  }

  protected calc(duration: number): number {
    const step = 100 / (this.maxDuration - this.minDuration);
    return Math.min(100, Math.max(0, step * (duration - this.minDuration)));
  }
}
