import { ContextType, handler, KernelInterfaceResolver } from '/ilos/common/index.ts';
import { Action } from '/ilos/core/index.ts';
import { copyFromContextMiddleware, validateDateMiddleware } from '/pdc/providers/middleware/index.ts';

import * as middlewareConfig from '../config/middlewares.ts';
import { groupPermissionMiddlewaresHelper } from '../middleware/groupPermissionMiddlewaresHelper.ts';
import { TripRepositoryProvider } from '../providers/TripRepositoryProvider.ts';
import { handlerConfig, ParamsInterface, ResultInterface } from '/shared/trip/searchcount.contract.ts';
import { alias } from '/shared/trip/searchcount.schema.ts';

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
  constructor(
    private pg: TripRepositoryProvider,
    private kernel: KernelInterfaceResolver,
  ) {
    super();
  }

  public async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    return this.pg.searchCount(params);
  }
}
