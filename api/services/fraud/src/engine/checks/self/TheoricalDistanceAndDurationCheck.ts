import { provider } from '@ilos/common';
import { GeoProviderInterfaceResolver } from '@pdc/provider-geo';

import { FraudCheckResult, HandleCheckInterface } from '../../../interfaces';
import { SelfCheckParamsInterface } from './SelfCheckParamsInterface';
import { SelfCheckPreparator } from '../SelfCheckPreparator';

/*
 * Check theorical distance and duration
 */
@provider()
export class TheoricalDistanceAndDurationCheck implements HandleCheckInterface<SelfCheckParamsInterface> {
  public static readonly key: string = 'theoricalDistanceAndDurationCheck';
  public readonly preparer = SelfCheckPreparator;

  constructor(private geoProvider: GeoProviderInterfaceResolver) {}

  async handle(params: SelfCheckParamsInterface): Promise<FraudCheckResult> {
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

    return Math.max(driver_distance_karma, driver_duration_karma, passenger_distance_karma, passenger_duration_karma);
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
    const delta = Math.abs(theorical - announced) / theorical;
    return Math.min(100, delta * 100);
  }
}
