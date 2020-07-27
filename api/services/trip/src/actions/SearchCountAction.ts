import { get, set } from 'lodash';
import { Action } from '@ilos/core';
import { handler, ContextType, KernelInterfaceResolver } from '@ilos/common';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/trip/searchcount.contract';
import { TripRepositoryProvider } from '../providers/TripRepositoryProvider';
import { alias } from '../shared/trip/searchcount.schema';

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
              authorizedTerritories.length &&
              territory_ids.filter((id) => authorizedTerritories.indexOf(id) !== -1).length > 0
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
export class SearchCountAction extends Action {
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

    return this.pg.searchCount(params);
  }
}
