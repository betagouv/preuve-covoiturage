import { Action } from '@ilos/core';
import { handler } from '@ilos/common';

import { handlerConfig, ParamsInterface } from '../shared/trip/publicStats.contract';
import { ResultInterface } from '../shared/trip/stats.contract';
import { TripRepositoryProvider } from '../providers/TripRepositoryProvider';
import { StatCacheRepositoryProviderInterfaceResolver } from '../interfaces/StatCacheRepositoryProviderInterface';
import { fillWithZeroes } from '../helpers/fillWithZeroesHelper';
import { StatInterface } from '../interfaces/StatInterface';
import { alias } from '../shared/trip/publicStats.schema';

@handler({
    ...handlerConfig,
    middlewares: [['validate', alias]],
})
export class PublicStatsAction extends Action {
  constructor(private pg: TripRepositoryProvider, private cache: StatCacheRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    return (
      (await this.cache.getOrBuild(async () => {
        const statInterface: StatInterface[] = await this.pg.stats(params);
        return statInterface.length === 0 ? [] : fillWithZeroes(statInterface, params);
      }, params)) || []
    );
  }
}
