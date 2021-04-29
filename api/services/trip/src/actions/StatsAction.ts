import { Action } from '@ilos/core';
import { handler, ContextType } from '@ilos/common';
import { copyGroupIdFromContextMiddlewares, validateDateMiddleware } from '@pdc/provider-middleware';

import { alias } from '../shared/trip/stats.schema';
import * as middlewareConfig from '../config/middlewares';
import { TripRepositoryProvider } from '../providers/TripRepositoryProvider';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/trip/stats.contract';
import { groupPermissionMiddlewaresHelper } from '../middleware/groupPermissionMiddlewaresHelper';
import { StatCacheRepositoryProviderInterfaceResolver } from '../interfaces/StatCacheRepositoryProviderInterface';

@handler({
  ...handlerConfig,
  middlewares: [
    ...copyGroupIdFromContextMiddlewares(['territory_id', 'operator_id'], null, true),
    ...groupPermissionMiddlewaresHelper({
      territory: 'territory.trip.stats',
      operator: 'operator.trip.stats',
      registry: 'registry.trip.stats',
    }),
    ['validate', alias],
    validateDateMiddleware({
      startPath: 'date.start',
      endPath: 'date.end',
      minStart: () => new Date(new Date().getTime() - middlewareConfig.date.minStartDefault),
      maxEnd: () => new Date(new Date().getTime() - middlewareConfig.date.maxEndDefault),
      applyDefault: true,
    }),
  ],
})
export class StatsAction extends Action {
  constructor(private pg: TripRepositoryProvider, private cache: StatCacheRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    return (await this.cache.getOrBuild(async () => this.pg.stats(params), params)) || [];
  }
}
