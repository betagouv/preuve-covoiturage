import { provider } from '@ilos/common';
import { GeoProviderInterfaceResolver } from '@pdc/provider-geo';
import { PostgresConnection } from '@ilos/connection-postgres';

import { AbstractQueryCheck } from '../AbstractQueryCheck';
import { FraudCheckResult } from '../../interfaces';

interface Params {
  acquisition_id: string;
  duration: number;
  start_position_lon: number;
  start_position_lat: number;
  end_position_lon: number;
  end_position_lat: number;
  distance: number;
}

interface Meta {
  distance?: number;
  duration?: number;
  error?: string;
}

/*
 * Check theorical distance and duration
 */
@provider()
export class TheoricalDistanceAndDurationCheck extends AbstractQueryCheck<Params,Meta> {
  public static readonly key: string = 'theoricalDistanceAndDurationCheck';

  constructor(
    private geoProvider: GeoProviderInterfaceResolver,
    connection: PostgresConnection,
  ) {
    super(connection);
  }

  public get query(): string {
    return `
      SELECT 
        acquisition_id,
        duration,
        ST_X(start_position::geometry) as start_position_lon,
        ST_Y(start_position::geometry) as start_position_lat,
        ST_X(end_position::geometry) as end_position_lon,
        ST_Y(end_position::geometry) as end_position_lat,
        distance
      FROM ${this.carpoolView}
    `;
  }

  async cursor(params: Params): Promise<FraudCheckResult<Meta>> {
    const { distance, duration } = await this.geoProvider.getRouteMeta(
      {
        lon: params.start_position_lon,
        lat: params.start_position_lat,
      },
      {
        lon: params.end_position_lon,
        lat: params.end_position_lat,
      },
    );
    return {
      meta: {
        distance,
        duration,
      },
      karma: Math.round(
        (this.calc(distance, params.distance) + this.calc(duration, params.duration)) / 2
      ),
    };
  }

  protected calc(theorical: number, announced: number): number {
    return (
      Math.abs(1 - (theorical / announced))
      *
      100
    );
  }
}
