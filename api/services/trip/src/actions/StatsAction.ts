// tslint:disable:variable-name
import { Action } from '@ilos/core';
import { handler, ContextType } from '@ilos/common';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/trip/stats.contract';
import { TripRepositoryProvider } from '../providers/TripRepositoryProvider';
import { ActionMiddleware } from '../shared/common/ActionMiddlewareInterface';
import { alias } from '../shared/trip/stats.schema';

@handler(handlerConfig)
export class StatsAction extends Action {
  public readonly middlewares: ActionMiddleware[] = [
    ['validate', alias],
    [
      'scopeIt',
      [
        ['trip.stats'],
        [
          (params, context) => {
            if (
              'territory_id' in params &&
              params.territory_id.length === 1 &&
              params.territory_id[0] === context.call.user.territory_id
            ) {
              return 'territory.trip.stats';
            }
          },
          (params, context) => {
            if (
              'operator_id' in params &&
              params.operator_id.length === 1 &&
              params.operator_id[0] === context.call.user.operator_id
            ) {
              return 'operator.trip.stats';
            }
          },
        ],
      ],
    ],
  ];

  constructor(private pg: TripRepositoryProvider) {
    super();
  }

  public async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    return (await this.pg.stats(this.applyDefaults(params))) || [];
  }

  protected applyDefaults(params: ParamsInterface): ParamsInterface {
    const finalParams = { ...params };

    finalParams.date = {
      start: finalParams.date.start || new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
      end: finalParams.date.end || new Date(),
    };

    return finalParams;
  }
}
