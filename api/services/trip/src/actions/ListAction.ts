import { Action } from '@ilos/core';
import { handler, ContextType, KernelInterfaceResolver } from '@ilos/common';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/trip/list.contract';
import { TripRepositoryProvider } from '../providers/TripRepositoryProvider';
import { alias } from '../shared/trip/list.schema';

// TODO
@handler({
  ...handlerConfig,
  middlewares: [
    ['validate', alias],
    [
      'scopeToGroup',
      {
        global: 'trip.list',
        territory: 'territory.trip.list',
        operator: 'operator.trip.list',
      },
    ],
  ],
})
export class ListAction extends Action {
  constructor(private pg: TripRepositoryProvider) {
    super();
  }

  public async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    const result = await this.pg.search(params);

    // get visible operators from user context
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
      })),
    };
  }
}
