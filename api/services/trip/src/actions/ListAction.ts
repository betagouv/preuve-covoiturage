import { get, set } from 'lodash';
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
            // if (
            //   'territory_id' in params &&
            //   context.call.user.territory_id &&
            //   context.call.user.authorizedTerritories.length &&
            //   params.territory_id.length &&
            //   params.territory_id.filter((id: number) => !context.call.user.authorizedTerritories.includes(id))
            //     .length === 0
            // ) {
            return 'territory.trip.list';
            // }
          },
          (params, context): string => {
            if (
              'operator_id' in params &&
              context.call.user.operator_id &&
              params.operator_id.length === 1 &&
              params.operator_id[0] === context.call.user.operator_id
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
    // handle territories
    if ('territory_id' in params) {
      const response = await this.kernel.call(
        'territory:getParentChildren',
        { _id: get(context, 'call.user.territory_id', null) },
        { call: { user: { permissions: ['territory.read'] } }, channel: { service: 'stats' } },
      );

      // merge all territory_id together
      set(params, 'territory_id', [...params.territory_id, ...(response.descendant_ids || [])]);
    }

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
      })),
    };
  }
}
