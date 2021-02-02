// tslint:disable:variable-name
import { Action } from '@ilos/core';
import { handler } from '@ilos/common';

import { ParamsInterface, ResultInterface } from '../shared/trip/stats.contract';
import { TripRepositoryProvider } from '../providers/TripRepositoryProvider';
import { StatCacheRepositoryProviderInterfaceResolver } from '../interfaces/StatCacheRepositoryProviderInterface';
import { ApiGraphTimeMode } from '../shared/trip/common/interfaces/ApiGraphTimeMode';

@handler({
  service: 'trip',
  method: 'publicStats',
})
export class PublicStatsAction extends Action {
  constructor(private pg: TripRepositoryProvider, private cache: StatCacheRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(): Promise<ResultInterface> {
    const params: ParamsInterface = {
      group_by: ApiGraphTimeMode.All,
    };

    return (await this.cache.getOrBuild(async () => this.pg.stats(params), params)) || [];
  }
}
