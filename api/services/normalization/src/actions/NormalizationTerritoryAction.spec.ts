import test from 'ava';

import { TerritoryProviderInterfaceResolver } from '../interfaces/TerritoryProviderInterface';
import { NormalizationTerritoryAction } from './NormalizationTerritoryAction';

test('Territory normalization action', async (t) => {
  class TerritoryProvider extends TerritoryProviderInterfaceResolver {
    async findByInsee(insee: string): Promise<number> {
      return insee.length;
    }
    async findByPoint({ lon, lat }: { lon: number; lat: number }): Promise<number> {
      return Math.floor(lon + lat * 1000);
    }
  }
  const provider = new TerritoryProvider();
  const action = new NormalizationTerritoryAction(provider);
  const params = {
    start: {
      geo_code: '012345',
      datetime: new Date('2020-01-01'),
    },
    end: {
      lat: 0.001,
      lon: 0.002,
      datetime: new Date('2020-02-02'),
    },
  };
  const result = await action.handle(params);

  t.is(result.start, params.start.geo_code.length, 'have start with territory id matching insee');

  t.is(result.end, Math.floor(params.end.lon + params.end.lat * 1000), 'have end with territory id matching lat lng');
});
