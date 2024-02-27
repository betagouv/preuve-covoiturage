import { handler } from '@ilos/common';
import { Action } from '@ilos/core';
import { copyFromContextMiddleware, validateDateMiddleware } from '@pdc/providers/middleware';
import * as middlewareConfig from '../config/middlewares';
import { fillWithZeroes } from '../helpers/fillWithZeroesHelper';
import { StatCacheRepositoryProviderInterfaceResolver } from '../interfaces/StatCacheRepositoryProviderInterface';
import { StatInterface } from '../interfaces/StatInterface';
import { groupPermissionMiddlewaresHelper } from '../middleware/groupPermissionMiddlewaresHelper';
import { TripRepositoryProvider } from '../providers/TripRepositoryProvider';
import { handlerConfig, ParamsInterface, ResultInterface } from '@shared/trip/stats.contract';
import { alias } from '@shared/trip/stats.schema';

@handler({
  ...handlerConfig,
  middlewares: [
    copyFromContextMiddleware(`call.user.operator_id`, 'operator_id', true),
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

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    return (
      (await this.cache.getOrBuild(async () => {
        const statInterface: StatInterface[] = await this.pg.stats(params);
        return statInterface.length === 0 ? [] : fillWithZeroes(statInterface, params);
      }, params)) || []
    );
  }
}
