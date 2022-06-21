import { ContextType, handler, KernelInterfaceResolver } from '@ilos/common';
import { Action } from '@ilos/core';
import { copyFromContextMiddleware, validateDateMiddleware } from '@pdc/provider-middleware';

import * as middlewareConfig from '../config/middlewares';
import { groupPermissionMiddlewaresHelper } from '../middleware/groupPermissionMiddlewaresHelper';
import { TripRepositoryProvider } from '../providers/TripRepositoryProvider';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/trip/searchcount.contract';
import { alias } from '../shared/trip/searchcount.schema';

@handler({
  ...handlerConfig,
  middlewares: [
    copyFromContextMiddleware(`call.user.operator_id`, 'operator_id', true),
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
      maxEnd: () => new Date(),
      applyDefault: true,
    }),
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
