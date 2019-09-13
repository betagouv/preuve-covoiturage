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
        ],
      ],
    ],
  ];

  constructor(private pg: TripPgRepositoryProvider) {
    super();
  }

  public async handle(params: TripSearchInterface, context: ContextType): Promise<any> {
    const fill = (acc, target, day, data = {}) => {
      Object.keys(data).forEach((key) => {
        acc[target][key] += data[key];
      });
      acc[target].days.push({
        day,
        ...data,
      });
    };
    const fillMonth = (acc, target, day, data = {}) => {
      const monthIndex = acc[target].months.findIndex((month) => month.date === day.getMonth());
      if (monthIndex == -1) {
        acc[target].months.push({
          date: day.getMonth(),
          ...data,
        });
      } else {
        const month = acc[target].months[monthIndex];
        Object.keys(data).forEach((key) => {
          month[key] += data[key];
        });
        acc[target].months[monthIndex] = month;
      }
    };
    const result = await this.pg.stats(params);

    const { carpoolers, carpoolers_per_vehicule, distance, trips } = result.reduce(
      (acc, current) => {
        // carpoolers
        fill(acc, 'carpoolers', current.day, { total: current.carpoolers });
        fillMonth(acc, 'carpoolers', current.day, { total: current.carpoolers });
        fill(acc, 'distance', current.day, { total: current.distance });
        fillMonth(acc, 'distance', current.day, { total: current.distance });
        fill(acc, 'trips', current.day, {
          total: current.trip,
          total_subsidized: current.trip_subsidized,
        });
        fillMonth(acc, 'trips', current.day, {
          total: current.trip,
          total_subsidized: current.trip_subsidized,
        });
        fill(acc, 'carpoolers_per_vehicule', current.day, { total: current.carpoolers / current.trip });

        return acc;
      },
      {
        carpoolers: {
          total: 0,
          days: [],
          months: [],
        },
        carpoolers_per_vehicule: {
          total: 0,
          days: [],
          months: [],
        },
        distance: {
          total: 0,
          days: [],
          months: [],
        },
        trips: {
          total: 0,
          total_subsidized: 0,
          days: [],
          months: [],
        },
      },
    );

    const cpvm = carpoolers_per_vehicule.days.reduce((acc, current) => {
      const month = current.day.getMonth();
      if (!(month in acc)) {
        acc[month] = [];
      }
      acc[month].push(current.total);
      return acc;
    }, {});
    return {
      carpoolers,
      carpoolers_per_vehicule: {
        total: carpoolers_per_vehicule.days.map((day) => day.total).reduce((acc, value) => acc + value, 0),
        months: Object.keys(cpvm).map((key) => ({
          month: key,
          total: cpvm[key].reduce((acc, curr) => acc + curr, 0) / cpvm[key].length,
        })),
        days: carpoolers_per_vehicule.days,
      },
      distance,
      trips,
    };
  }
}
