import test from 'ava';
import { GeoProviderInterfaceResolver } from '@pdc/providers/geo';
import { PartialGeoInterface, GeoInterface } from '../interfaces';
import { GeoNormalizerProvider } from './GeoNormalizerProvider';

class GeoProvider extends GeoProviderInterfaceResolver {
  async checkAndComplete(data: PartialGeoInterface): Promise<GeoInterface> {
    const lat = data.lat || 0;
    const lon = data.lon || 0;
    return {
      lat,
      lon,
      geo_code: `${lat.toString(10)}_${lon.toString(10)}`,
    };
  }
}

test('Geo normalizer should return expected result', async (t) => {
  const provider = new GeoProvider();
  const normalizer = new GeoNormalizerProvider(provider);

  const result = await normalizer.handle({
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

  const resultProperties = Reflect.ownKeys(result);
  t.true(resultProperties.indexOf('start') > -1);
  t.true(Reflect.ownKeys(result.start).indexOf('geo_code') > -1);
  t.is(
    result.start.geo_code,
    `${result.start.lat.toString(10)}_${result.start.lon.toString(10)}`,
    'have start.insee property matching lat, lon values',
  );

  t.true(resultProperties.indexOf('end') > -1);
  t.true(Reflect.ownKeys(result.end).indexOf('geo_code') > -1);
  t.is(
    result.end.geo_code,
    `${result.end.lat.toString(10)}_${result.end.lon.toString(10)}`,
    'have end.insee property matching lat, lon values',
  );
});
