// tslint:disable:variable-name
import { get, set } from 'lodash';
import { Action } from '@ilos/core';
import { handler, ContextType, KernelInterfaceResolver } from '@ilos/common';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/trip/stats.contract';
import { TripRepositoryProvider } from '../providers/TripRepositoryProvider';
import { alias } from '../shared/trip/stats.schema';
import { StatCacheRepositoryProviderInterfaceResolver } from '../interfaces/StatCacheRepositoryProviderInterface';

@handler({
  ...handlerConfig,
  middlewares: [
    ['validate', alias],
    [
      'scopeIt',
      [
        ['trip.stats'],
        [
          (params, context): string => {
            const territory_ids = params.territory_id || [context.call.user.territory_id];
            const authorizedTerritories = context.call.user.authorizedTerritories;
            if (
              territory_ids &&
              territory_ids.length > 0 &&
              authorizedTerritories &&
              authorizedTerritories.length > 0 &&
              territory_ids.filter((id) => authorizedTerritories.indexOf(id) < 0).length === 0
            ) {
              return 'territory.trip.stats';
            }
          },
          (params, context): string => {
            if (
              'operator_id' in params &&
              context.call.user.operator_id &&
              params.operator_id.length === 1 &&
              params.operator_id.indexOf(context.call.user.operator_id) !== -1
            ) {
              return 'operator.trip.stats';
            }
          },
        ],
      ],
    ],
  ],
})
export class StatsAction extends Action {
  constructor(
    private kernel: KernelInterfaceResolver,
    private pg: TripRepositoryProvider,
    private cache: StatCacheRepositoryProviderInterfaceResolver,
  ) {
    super();
  }

  public async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    // override params with real user's territory_id or operator_id
    const context_tid = this.castTypeId('territory_id', context);
    if (context_tid) set(params, 'territory_id', context_tid);

    const context_oid = this.castTypeId('operator_id', context);
    if (context_oid) set(params, 'operator_id', context_oid);

    switch (this.isCachable(params)) {
      case 'global':
        return (await this.cache.getOrBuild(async () => this.pg.stats(params), {})) || [];
      case 'operator':
        return (
          (await this.cache.getOrBuild(async () => this.pg.stats(params), { operator_id: params.operator_id[0] })) || []
        );
      case 'territory':
        return (
          (await this.cache.getOrBuild(async () => this.pg.stats(params), { territory_id: params.territory_id[0] })) ||
          []
        );
      default:
        return (await this.pg.stats(this.applyDefaults(params))) || [];
    }
  }

  protected castTypeId(type: 'territory_id' | 'operator_id', context: ContextType): number[] {
    const val = get(context, `call.user.${type}`, undefined);

    return val ? (Array.isArray(val) ? val : [val]) : undefined;
  }

  protected isCachable(params: ParamsInterface): null | 'global' | 'operator' | 'territory' {
    const keys = Object.keys(params).filter((i) => !!params[i]);

    if (keys.length > 1) {
      return;
    }

    if (keys.length === 0) {
      return 'global';
    }

    if (keys[0] === 'operator_id') {
      if (Array.isArray(params.operator_id) && params.operator_id.length === 1) {
        return 'operator';
      }
      return;
    }

    if (keys[0] === 'territory_id') {
      if (Array.isArray(params.territory_id) && params.territory_id.length === 1) {
        return 'territory';
      }
      return;
    }

    return;
  }

  protected applyDefaults(params: ParamsInterface): ParamsInterface {
    const finalParams = { ...params };

    finalParams.date = {
      start: get(finalParams, 'date.start', new Date(new Date().setFullYear(new Date().getFullYear() - 1))),
      end: get(finalParams, 'date.end', new Date()),
    };

    return finalParams;
  }
}
