// tslint:disable:variable-name
import { Action } from '@ilos/core';
import { handler, ContextType } from '@ilos/common';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/trip/stats.contract';
import { TripPgRepositoryProvider } from '../providers/TripPgRepositoryProvider';
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
              params.territory_id[0] === context.call.user.territory
            ) {
              return 'territory.trip.stats';
            }
          },
          (params, context) => {
            if (
              'operator_id' in params &&
              params.operator_id.length === 1 &&
              params.operator_id[0] === context.call.user.operator
            ) {
              return 'operator.trip.stats';
            }
          },
        ],
      ],
    ],
  ];

  constructor(private pg: TripPgRepositoryProvider) {
    super();
  }

  public async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    return (await this.pg.stats(params)) || [];
  }
}
