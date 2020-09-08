import { Action } from '@ilos/core';
import { handler, ContextType, KernelInterfaceResolver } from '@ilos/common';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/trip/list.contract';
import { TripRepositoryProvider } from '../providers/TripRepositoryProvider';
import { alias } from '../shared/trip/list.schema';

@handler({
  ...handlerConfig,
  middlewares: [
    ['validate', alias],
    [
      'scopeIt',
      [
        ['trip.list'],
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
              return 'territory.trip.list';
            }
          },
          (params, context): string => {
            if (
              'operator_id' in params &&
              context.call.user.operator_id &&
              params.operator_id.length === 1 &&
              params.operator_id.indexOf(context.call.user.operator_id) !== -1
            ) {
              return 'operator.trip.list';
            }
          },
        ],
      ],
    ],
  ],
})
export class ListAction extends Action {
  constructor(private pg: TripRepositoryProvider, private kernel: KernelInterfaceResolver) {
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
