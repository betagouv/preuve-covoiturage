import test from 'ava';
import { GeoProviderInterfaceResolver } from '@pdc/provider-geo';
import { PointInterface, RouteMeta } from '@pdc/provider-geo/dist/interfaces';

import { NormalizationRouteAction } from './NormalizationRouteAction';

test('Route normalization action', async (t) => {
  class GeoProvider extends GeoProviderInterfaceResolver {
    async getRouteMeta(start: PointInterface, end: PointInterface): Promise<RouteMeta> {
      return {
        distance: (start.lat + end.lat) * 1000,
        duration: (start.lon + end.lon) * 1000,
      };
    }
  }
  const geoProvider = new GeoProvider();
  const action = new NormalizationRouteAction(geoProvider);
  const params = {
    start: {
      lat: 0.001,
      lon: 0.002,
    },
    end: {
      lat: 0.003,
      lon: 0.004,
    },
  };
  const result = await action.handle(params);

  t.is(result.calc_distance, (params.start.lat + params.end.lat) * 1000, 'have calc_distance matching params');
  t.is(result.calc_duration, (params.start.lon + params.end.lon) * 1000, 'have calc_distance matching params');
});
