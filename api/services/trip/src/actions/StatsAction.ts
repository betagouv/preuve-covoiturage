// tslint:disable:variable-name
import { Action } from '@ilos/core';
import { handler, ContextType, KernelInterfaceResolver, ConfigInterfaceResolver } from '@ilos/common';
import { TripSearchInterface } from '@pdc/provider-schema/dist';

import { TripPgRepositoryProvider } from '../providers/TripPgRepositoryProvider';

/*
 * Stats trips
 */
@handler({
  service: 'trip',
  method: 'stats',
})
export class StatsAction extends Action {
  public readonly middlewares: (string | [string, any])[] = [
    ['validate', 'trip.search'],
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

  public async handle(params: TripSearchInterface, context: ContextType): Promise<any> {
    return (await this.pg.stats(params)) || [];
  }
}
