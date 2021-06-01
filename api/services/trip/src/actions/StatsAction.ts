import { Action } from '@ilos/core';
import { copyGroupIdFromContextMiddlewares, validateDateMiddleware } from '@pdc/provider-middleware';

import { handler } from '@ilos/common';

import { alias } from '../shared/trip/stats.schema';
import * as middlewareConfig from '../config/middlewares';
import { TripRepositoryProvider } from '../providers/TripRepositoryProvider';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/trip/stats.contract';
import { groupPermissionMiddlewaresHelper } from '../middleware/groupPermissionMiddlewaresHelper';
import { StatCacheRepositoryProviderInterfaceResolver } from '../interfaces/StatCacheRepositoryProviderInterface';
import { StatInterface } from '../interfaces/StatInterface';
import { ApiGraphTimeMode } from '../shared/trip/common/interfaces/ApiGraphTimeMode';

@handler({
  ...handlerConfig,
  middlewares: [
    ...copyGroupIdFromContextMiddlewares(['territory_id', 'operator_id'], null, true),
    ...groupPermissionMiddlewaresHelper({
      territory: 'territory.trip.stats',
      operator: 'operator.trip.stats',
      registry: 'registry.trip.stats',
    }),
    ['validate', alias],
    validateDateMiddleware({
      startPath: 'date.start',
      endPath: 'date.end',
      minStart: () => new Date(new Date().getTime() - middlewareConfig.date.minStartDefault),
      maxEnd: () => new Date(new Date().getTime() - middlewareConfig.date.maxEndDefault),
      applyDefault: true,
    }),
  ],
})
export class StatsAction extends Action {
  constructor(private pg: TripRepositoryProvider, private cache: StatCacheRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    return (
      (await this.cache.getOrBuild(async () => {
        const statInterface: StatInterface[] = await this.pg.stats(params);
        return statInterface.length === 0 ? [] : this.fillWithZeroes(statInterface, params);
      }, params)) || []
    );
  }

  private fillWithZeroes(result: StatInterface[], params: ParamsInterface): ResultInterface {
    // results for totals don't need filling
    if (params.group_by === ApiGraphTimeMode.All) return result;

    // fill empty days or months with 0 values to avoid gaps in the charts
    return this.dateRange(params.group_by, params.date.start, params.date.end).map((item) => {
      const emptyRow = {
        trip: 0,
        distance: 0,
        carpoolers: 0,
        operators: 0,
        average_carpoolers_by_car: 0,
        trip_subsidized: 0,
        financial_incentive_sum: 0,
        incentive_sum: 0,
      };

      // set 'day' or 'month' prop
      emptyRow[params.group_by] = item;

      // search for matching month or day or replace by default values
      return result.find((row) => row[params.group_by] === item) || emptyRow;
    });
  }

  private dateRange(type: ApiGraphTimeMode, start: Date, end: Date): string[] {
    const arr = [];
    const len = type === 'day' ? 10 : 7;
    const fn = type === 'day' ? 'Date' : 'Month';

    if (type === 'month') {
      start.setDate(1);
    }

    while (start <= end) {
      arr.push(start.toISOString().substr(0, len));
      start = new Date(start[`set${fn}`](start[`get${fn}`]() + 1));
    }

    return arr;
  }
}
