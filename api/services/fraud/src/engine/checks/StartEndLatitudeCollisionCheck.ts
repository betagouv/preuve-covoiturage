import { provider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';

import { AbstractQueryCheck } from '../AbstractQueryCheck';
import { FraudCheckResult } from '../../interfaces';

interface Params {
  acquisition_id: string;
  start_lat: number;
  end_lat: number;
}

interface Meta {
  error?: string;
  delta?: number;
}

/*
 * Check start and end latitude collision
 */
@provider()
export class StartEndLatitudeCollisionCheck extends AbstractQueryCheck<Params,Meta> {
  public static readonly key: string = 'startEndLatitudeCollisionCheck';

  protected readonly maxLat: number = 0.001; // above = 0
  protected readonly minLat: number = 0; // below = 100

  constructor(
    connection: PostgresConnection,
  ) {
    super(connection);
  }

  public get query(): string {
    return `
    SELECT
      acquisition_id,
      ST_Y(start_position::geometry) as start_lat,
      ST_Y(end_position::geometry) as end_lat
    FROM ${this.carpoolView}
    `;
  }

  async cursor(params: Params): Promise<FraudCheckResult<Meta>> {
    const {
      start_lat,
      end_lat,
    } = params;

    const delta = Math.abs((start_lat - end_lat));
    const result = Math.round((100 - (100 / this.maxLat * delta)));

    return {
      meta: {
        delta,
      },
      karma: Math.min(100, Math.max(0, result)),
    };
  }
}
