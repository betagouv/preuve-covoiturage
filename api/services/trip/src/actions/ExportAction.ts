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
    const result = await this.pg.search(params);
    return {
      ...result,
      data: result.data.map((r) => ({
        ...r,
        campaigns_id: [],
        status: 'locked',
      })),
    };
  }
}
