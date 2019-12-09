import { Action } from '@ilos/core';
import { handler, ContextType } from '@ilos/common';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/trip/list.contract';
import { TripRepositoryProvider } from '../providers/TripRepositoryProvider';
import { ActionMiddleware } from '../shared/common/ActionMiddlewareInterface';
import { alias } from '../shared/trip/list.schema';

@handler(handlerConfig)
export class ListAction extends Action {
  public readonly middlewares: ActionMiddleware[] = [
    ['validate', alias],
    [
      'scopeIt',
      [
        ['trip.list'],
        [
          (params, context) => {
            if (
              'territory_id' in params &&
              params.territory_id.length === 1 &&
              params.territory_id[0] === context.call.user.territory_id
            ) {
              return 'territory.trip.list';
            }
          },
          (params, context) => {
            if (
              'operator_id' in params &&
              params.operator_id.length === 1 &&
              params.operator_id[0] === context.call.user.operator_id
            ) {
              return 'operator.trip.list';
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
    // get visible operators from user context
    const result = await this.pg.search(params);

    let authorizedOperators = null;
    if (context.call && context.call.user && context.call.user.authorizedOperators) {
      authorizedOperators = context.call.user.authorizedOperators;
    }

    return {
      ...result,
      data: result.data.map((r) => ({
        ...r,
        operator_id:
          authorizedOperators === null
            ? r.operator_id
            : authorizedOperators.indexOf(r.operator_id) === -1
            ? null
            : r.operator_id,
        campaigns_id: [],
        status: 'locked',
      })),
    };
  }
}
