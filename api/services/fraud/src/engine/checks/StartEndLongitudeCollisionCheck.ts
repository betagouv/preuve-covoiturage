import { provider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';

import { AbstractQueryCheck } from '../AbstractQueryCheck';
import { FraudCheckResult } from '../../interfaces';

interface Params {
  acquisition_id: number;
  start_lon: number;
  end_lon: number;
}

interface Meta {
  error?: string;
  delta: number;
}

/*
 * Check start and end longitude collision
 */
@provider()
export class StartEndLongitudeCollisionCheck extends AbstractQueryCheck<Params, Meta> {
  public static readonly key: string = 'startEndLongitudeCollisionCheck';

  protected readonly maxLon: number = 0.001; // above = 0
  protected readonly minLon: number = 0; // below = 100

  constructor(connection: PostgresConnection) {
    super(connection);
  }

  public get query(): string {
    return `
    SELECT
      acquisition_id,
      ST_X(start_position::geometry) as start_lon,
      ST_X(end_position::geometry) as end_lon
    FROM ${this.datasource}
    `;
  }

  async cursor(params: Params): Promise<FraudCheckResult<Meta>> {
    const { start_lon, end_lon } = params;

    const delta = Math.abs(start_lon - end_lon);
    const result = 100 - (100 / this.maxLon) * delta;

    return {
      meta: {
        delta,
      },
      karma: Math.min(100, Math.max(0, result)),
    };
  }
}
