import { Action } from '@ilos/core';
import { handler, ContextType } from '@ilos/common';
import { TripSearchInterface } from '@pdc/provider-schema/dist';

import { TripPgRepositoryProvider } from '../providers/TripPgRepositoryProvider';

/**
 * List trips
 */
@handler({
  service: 'trip',
  method: 'list',
})
export class ListAction extends Action {
  public readonly middlewares: (string | [string, any])[] = [
    ['validate', 'trip.search'],
    [
      'scopeIt',
      [
        ['trip.list'],
        [
          (params, context) => {
            if (
              'territory_id' in params &&
              params.territory_id.length === 1 &&
              params.territory_id[0] === context.call.user.territory
            ) {
              return 'territory.trip.list';
            }
          },
          (params, context) => {
            if (
              'operator_id' in params &&
              params.operator_id.length === 1 &&
              params.operator_id[0] === context.call.user.operator
            ) {
              return 'operator.trip.list';
            }
          },
        ],
      ],
    ],
  ];

  constructor(private pg: TripPgRepositoryProvider) {
    super();
  }

  public async handle(params: TripSearchInterface, context: ContextType): Promise<any> {
    const result = await this.pg.search(params);
    return result.map((r) => ({
      ...r,
      campaigns_id: [],
      status: 'locked',
    }));
  }
}
