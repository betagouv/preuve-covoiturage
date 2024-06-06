import test from 'ava';
import { GeoProviderInterfaceResolver } from '/pdc/providers/geo/index.ts';
import { PointInterface, RouteMeta } from '../interfaces/index.ts';

import { RouteNormalizerProvider } from './RouteNormalizerProvider.ts';

test('Route normalizer', async (t) => {
  class GeoProvider extends GeoProviderInterfaceResolver {
    async getRouteMeta(start: PointInterface, end: PointInterface): Promise<RouteMeta> {
      return {
        distance: (start.lat + end.lat) * 1000,
        duration: (start.lon + end.lon) * 1000,
      };
    }
  }
  const geoProvider = new GeoProvider();
  const normalizer = new RouteNormalizerProvider(geoProvider);
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
  const result = await normalizer.handle(params);

  t.is(result.calc_distance, (params.start.lat + params.end.lat) * 1000, 'have calc_distance matching params');
  t.is(result.calc_duration, (params.start.lon + params.end.lon) * 1000, 'have calc_distance matching params');
});
