// tslint:disable:variable-name
import { get } from 'lodash';
import { Action } from '@ilos/core';
import { handler, ContextType } from '@ilos/common';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/trip/stats.contract';
import { TripRepositoryProvider } from '../providers/TripRepositoryProvider';
import { alias } from '../shared/trip/stats.schema';
import { StatCacheRepositoryProviderInterfaceResolver } from '../interfaces/StatCacheRepositoryProviderInterface';

@handler({
  ...handlerConfig,
  middlewares: [
    ['validate', alias],
    [
      'scopeToGroup',
      {
        global: 'trip.stats',
        territory: 'territory.trip.stats',
        operator: 'operator.trip.stats',
      },
    ],
  ],
})
export class StatsAction extends Action {
  constructor(
    private pg: TripRepositoryProvider,
    private cache: StatCacheRepositoryProviderInterfaceResolver,
  ) {
    super();
  }

  public async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    return (await this.cache.getOrBuild(async () => this.pg.stats(params), params)) || [];
  }
}
