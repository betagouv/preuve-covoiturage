import { provider } from '@ilos/common';
import { GeoProviderInterfaceResolver } from '@pdc/provider-geo';

import { FraudCheckResult } from '../../../interfaces';

interface Params {
  driver_distance: number;
  driver_duration: number;
  passenger_distance: number;
  passenger_duration: number;
  driver_start_lon: number;
  driver_start_lat: number;
  driver_end_lon: number;
  driver_end_lat: number;
  passenger_start_lon: number;
  passenger_start_lat: number;
  passenger_end_lon: number;
  passenger_end_lat: number;
  driver_calc_distance?: number;
  driver_calc_duration?: number;
  passenger_calc_distance?: number;
  passenger_calc_duration?: number;
}

interface Meta {
  driver_distance_karma?: number;
  driver_duration_karma?: number;
  passenger_distance_karma?: number;
  passenger_duration_karma?: number;
}

/*
 * Check theorical distance and duration
 */
@provider()
export class TheoricalDistanceAndDurationCheck {
  public static readonly key: string = 'theoricalDistanceAndDurationCheck';

  constructor(private geoProvider: GeoProviderInterfaceResolver) {}

  async cursor(params: Params): Promise<FraudCheckResult<Meta>> {
    const {
      driver_distance,
      driver_duration,
      passenger_distance,
      passenger_duration,
      driver_start_lon,
      driver_start_lat,
      driver_end_lon,
      driver_end_lat,
      passenger_start_lon,
      passenger_start_lat,
      passenger_end_lon,
      passenger_end_lat,
      driver_calc_distance,
      driver_calc_duration,
      passenger_calc_distance,
      passenger_calc_duration,
    } = params;

    const { distance: driver_distance_karma, duration: driver_duration_karma } = await this.karma(
      driver_distance,
      driver_duration,
      driver_start_lat,
      driver_start_lon,
      driver_end_lat,
      driver_end_lon,
      driver_calc_distance,
      driver_calc_duration,
    );
    const { distance: passenger_distance_karma, duration: passenger_duration_karma } = await this.karma(
      passenger_distance,
      passenger_duration,
      passenger_start_lat,
      passenger_start_lon,
      passenger_end_lat,
      passenger_end_lon,
      passenger_calc_distance,
      passenger_calc_duration,
    );
    return {
      meta: {
        driver_distance_karma,
        driver_duration_karma,
        passenger_distance_karma,
        passenger_duration_karma,
      },
      karma: Math.max(driver_distance_karma, driver_duration_karma, passenger_distance_karma, passenger_duration_karma),
    };
  }
  protected async karma(
    distance: number,
    duration: number,
    start_lat: number,
    start_lon: number,
    end_lat: number,
    end_lon: number,
    calc_distance?: number,
    calc_duration?: number,
  ): Promise<{ distance: number; duration: number }> {
    let theoricalDistance = calc_distance;
    let theoricalDuration = calc_duration;

    if (!calc_distance || !calc_duration) {
      ({ distance: theoricalDistance, duration: theoricalDuration } = await this.calcDistanceAndDuration(
        start_lat,
        start_lon,
        end_lat,
        end_lon,
      ));
    }

    return {
      distance: this.calc(theoricalDistance, distance),
      duration: this.calc(theoricalDuration, duration),
    };
  }

  protected async calcDistanceAndDuration(
    start_lat: number,
    start_lon: number,
    end_lat: number,
    end_lon: number,
  ): Promise<{ distance: number; duration: number }> {
    return this.geoProvider.getRouteMeta(
      {
        lon: start_lon,
        lat: start_lat,
      },
      {
        lon: end_lon,
        lat: end_lat,
      },
    );
  }

  protected calc(theorical: number, announced: number): number {
    if (announced === 0) {
      return 100;
    }

    return Math.abs(1 - theorical / announced) * 100;
  }
}
