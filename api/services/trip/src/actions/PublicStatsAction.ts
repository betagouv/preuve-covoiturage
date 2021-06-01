import { Action } from '@ilos/core';
import { handler } from '@ilos/common';

import { ResultInterface } from '../shared/trip/stats.contract';
import { TripRepositoryProvider } from '../providers/TripRepositoryProvider';
import { StatCacheRepositoryProviderInterfaceResolver } from '../interfaces/StatCacheRepositoryProviderInterface';
import { PublicTripSearchInterface } from '../shared/trip/common/interfaces/TripSearchInterface';
import { fillWithZeroes } from '../helpers/fillWithZeroesHelper';
import { StatInterface } from '../interfaces/StatInterface';

@handler({
  service: 'trip',
  method: 'publicStats',
})
export class PublicStatsAction extends Action {
  constructor(private pg: TripRepositoryProvider, private cache: StatCacheRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: PublicTripSearchInterface): Promise<ResultInterface> {
    return (
      (await this.cache.getOrBuild(async () => {
        const statInterface: StatInterface[] = await this.pg.stats(params);
        return statInterface.length === 0 ? [] : fillWithZeroes(statInterface, params);
      }, params)) || []
    );
  }
}
