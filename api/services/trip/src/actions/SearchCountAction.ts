import { Action } from '@ilos/core';
import { handler, ContextType, KernelInterfaceResolver } from '@ilos/common';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/trip/searchcount.contract';
import { TripRepositoryProvider } from '../providers/TripRepositoryProvider';
import { alias } from '../shared/trip/searchcount.schema';

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
        startPath: 'date.date',
        endPath: 'date.end',
        minStart: () => new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 365 * 2),
        maxEnd: () => new Date(),
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
