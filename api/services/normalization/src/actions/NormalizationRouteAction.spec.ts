// tslint:disable max-classes-per-file
import { describe } from 'mocha';
import { expect } from 'chai';
import { GeoProviderInterfaceResolver } from '@pdc/provider-geo';
import { PartialGeoInterface, GeoInterface, PointInterface, RouteMeta } from '@pdc/provider-geo/dist/interfaces';

import { TerritoryProviderInterfaceResolver } from '../interfaces/TerritoryProviderInterface';
import { NormalizationRouteAction } from './NormalizationRouteAction';

class GeoProvider extends GeoProviderInterfaceResolver {
  async getRouteMeta(start: PointInterface, end: PointInterface): Promise<RouteMeta> {
    return {
      distance: (start.lat + end.lat) * 1000,
      duration: (start.lon + end.lon) * 1000,
    };
  }
}

describe('Route normalization action', async () => {
  it('Should', async () => {
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

    console.log('result : ', result);

    expect(result).has.own.property(
      'calc_distance',
      (params.start.lat + params.end.lat) * 1000,
      'have calc_distance matching params',
    );
    expect(result).has.own.property(
      'calc_duration',
      (params.start.lon + params.end.lon) * 1000,
      'have calc_distance matching params',
    );
  });
});
