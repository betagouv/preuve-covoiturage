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
      'scopeIt',
      [
        ['trip.stats'],
        [
          (params, context): string => {
            if (
              'territory_id' in params &&
              context.call.user.territory_id &&
              context.call.user.authorizedTerritories.length &&
              params.territory_id.length &&
              params.territory_id.filter((id: number) => !context.call.use.authorizedTerritories.includes(id))
                .length === 0
            ) {
              return 'territory.trip.stats';
            }
          },
          (params, context): string => {
            if (
              'operator_id' in params &&
              context.call.user.operator_id &&
              params.operator_id.length === 1 &&
              params.operator_id[0] === context.call.user.operator_id
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
  constructor(private pg: TripRepositoryProvider, private cache: StatCacheRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    switch (this.isCachable(params)) {
      case 'global':
        return (await this.cache.getGeneralOrBuild(async () => this.pg.stats(params))) || [];
      case 'operator':
        return (await this.cache.getOperatorOrBuild(params.operator_id[0], async () => this.pg.stats(params))) || [];
      case 'territory':
        return (await this.cache.getTerritoryOrBuild(params.territory_id[0], async () => this.pg.stats(params))) || [];
      default:
        return (await this.pg.stats(this.applyDefaults(params))) || [];
    }
  }

  protected isCachable(params: ParamsInterface): null | 'global' | 'operator' | 'territory' {
    const keys = Object.keys(params);

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
