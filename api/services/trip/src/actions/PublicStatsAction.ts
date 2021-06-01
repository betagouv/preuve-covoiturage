import { Action } from '@ilos/core';
import { handler } from '@ilos/common';

import { ResultInterface } from '../shared/trip/stats.contract';
import { TripRepositoryProvider } from '../providers/TripRepositoryProvider';
import { StatCacheRepositoryProviderInterfaceResolver } from '../interfaces/StatCacheRepositoryProviderInterface';
import { PublicTripSearchInterface } from '../shared/trip/common/interfaces/TripSearchInterface';

@handler({
  service: 'trip',
  method: 'publicStats',
})
export class PublicStatsAction extends Action {
  constructor(private pg: TripRepositoryProvider, private cache: StatCacheRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: PublicTripSearchInterface): Promise<ResultInterface> {
    return (await this.cache.getOrBuild(async () => this.pg.stats(params), params)) || [];
  }
}
