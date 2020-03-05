// tslint:disable max-classes-per-file
import { describe } from 'mocha';
import { expect } from 'chai';

import { TerritoryProviderInterfaceResolver } from '../interfaces/TerritoryProviderInterface';
import { NormalizationTerritoryAction } from './NormalizationTerritoryAction';

class TerritoryProvider extends TerritoryProviderInterfaceResolver {
  async findByInsee(insee: string): Promise<number> {
    return insee.length;
  }
  async findByPoint({ lon, lat }: { lon: number; lat: number }): Promise<number> {
    return Math.floor(lon + lat * 1000);
  }
}

describe('Territory normalization action', async () => {
  it('Should', async () => {
    const provider = new TerritoryProvider();
    const action = new NormalizationTerritoryAction(provider);
    const params = {
      start: {
        insee: '012345',
        datetime: new Date('2020-01-01'),
      },
      end: {
        lat: 0.001,
        lon: 0.002,
        datetime: new Date('2020-02-02'),
      },
    };
    const result = await action.handle(params);

    expect(result).has.own.property('start', params.start.insee.length, 'have start with territory id matching insee');

    expect(result).has.own.property(
      'end',
      Math.floor(params.end.lon + params.end.lat * 1000),
      'have end with territory id matching lat lng',
    );
  });
});
