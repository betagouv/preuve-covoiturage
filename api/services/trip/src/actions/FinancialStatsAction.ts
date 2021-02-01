// tslint:disable:variable-name
import { Action } from '@ilos/core';
import { handler, ContextType } from '@ilos/common';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/trip/financialStats.contract';
import { TripRepositoryProvider } from '../providers/TripRepositoryProvider';
import { alias } from '../shared/trip/stats.schema';
import { StatCacheRepositoryProviderInterfaceResolver } from '../interfaces/StatCacheRepositoryProviderInterface';
import * as middlewareConfig from '../config/middlewares';

@handler({
  ...handlerConfig,
  middlewares: [
    ['validate', alias],
    [
      'scopeToGroup',
      {
        global: 'trip.stats',
        territory: 'territory.trip.stats',
        operator: 'operator.trip.stats',
      },
    ],
    [
      'validate.date',
      {
        startPath: 'date.start',
        endPath: 'date.end',
        minStart: () => new Date(new Date().getTime() - middlewareConfig.date.minStartDefault),
        maxEnd: () => new Date(),
        applyDefault: true,
      },
    ],
  ],
})
export class FinancialStatsAction extends Action {
  constructor(private pg: TripRepositoryProvider, private cache: StatCacheRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    return (await this.pg.financialStats(params)) || [];
  }
}
