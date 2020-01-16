import { describe } from 'mocha';
import { expect } from 'chai';
import { GeoProviderInterfaceResolver } from '@pdc/provider-geo';
import { PartialGeoInterface, GeoInterface } from '@pdc/provider-geo/dist/interfaces';

import { NormalizationGeoAction } from './NormalizationGeoAction';

class GeoProvider extends GeoProviderInterfaceResolver {
  async checkAndComplete(data: PartialGeoInterface): Promise<GeoInterface> {
    return {
      lat: data.lat,
      lon: data.lon,
      insee: `${data.lat.toString(10)}_${data.lon.toString(10)}`,
    };
  }
}

describe('Geo normalization action', async () => {
  it('Should return expected result', async () => {
    const provider = new GeoProvider();
    const action = new NormalizationGeoAction(provider);

    const result = await action.handle({
      start: {
        lat: 0.0001,
        lon: 0.0002,
        datetime: new Date(),
      },
      end: {
        lat: 0.0003,
        lon: 0.0004,
        datetime: new Date(),
      },
    });

    expect(result).to.have.property('start');
    expect(result.start).to.have.own.property(
      'insee',
      `${result.start.lat.toString(10)}_${result.start.lon.toString(10)}`,
      'have start.insee property matching lat, lon values',
    );

    expect(result).to.have.property('end');
    expect(result.end).to.have.own.property(
      'insee',
      `${result.end.lat.toString(10)}_${result.end.lon.toString(10)}`,
      'have end.insee property matching lat, lon values',
    );
  });
});
