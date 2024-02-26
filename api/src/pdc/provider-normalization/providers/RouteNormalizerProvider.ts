import { provider } from '@ilos/common';
import { GeoProviderInterfaceResolver } from '@pdc/provider-geo';
import { RouteNormalizerProviderInterface, RouteParamsInterface, RouteResultInterface } from '../interfaces';

@provider()
export class RouteNormalizerProvider implements RouteNormalizerProviderInterface {
  constructor(private geoProvider: GeoProviderInterfaceResolver) {}

  public async handle(payload: RouteParamsInterface): Promise<RouteResultInterface> {
    // calc distance and duration for passenger
    const passengerRoute = await this.geoProvider.getRouteMeta(payload.start, payload.end);
    return {
      calc_distance: Math.floor(passengerRoute.distance),
      calc_duration: Math.floor(passengerRoute.duration),
    };
  }
}
