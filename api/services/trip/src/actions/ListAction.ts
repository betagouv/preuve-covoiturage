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
    return Object.values(
      result.reduce((acc, current) => {
        const { trip_id, operator_class, start_datetime, ...people } = current;
        if (!(trip_id in acc)) {
          acc[trip_id] = {
            trip_id,
            start: start_datetime,
            people: [],
          };
        }

        if (start_datetime < acc[trip_id].start) {
          acc[trip_id].start = start_datetime;
        }

        acc[trip_id].people.push({
          ...people,
          rank: operator_class,
        });
        return acc;
      }, {}),
    );
  }
}
