import { Action } from '@ilos/core';
import { handler, ContextType, KernelInterfaceResolver } from '@ilos/common';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/trip/searchcount.contract';
import { TripRepositoryProvider } from '../providers/TripRepositoryProvider';
import { alias } from '../shared/trip/searchcount.schema';
import * as middlewareConfig from '../config/middlewares';

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
export class SearchCountAction extends Action {
  constructor(private pg: TripRepositoryProvider, private kernel: KernelInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    return this.pg.searchCount(params);
  }
}
