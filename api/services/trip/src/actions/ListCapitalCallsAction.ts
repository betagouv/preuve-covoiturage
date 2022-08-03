import { ContextType, handler } from '@ilos/common';
import { Action } from '@ilos/core';
import { groupPermissionMiddlewaresHelper } from '../middleware/groupPermissionMiddlewaresHelper';
import { TripRepositoryProvider } from '../providers/TripRepositoryProvider';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/trip/listCapitalCalls.contract';
import { alias } from '../shared/trip/listCapitalCalls.schema';

@handler({
  ...handlerConfig,
  middlewares: [
    ...groupPermissionMiddlewaresHelper({
      territory: 'territory.capitalcall.list',
      operator: 'operator.capitalcall.list',
      registry: 'registry.capitalcall.list',
    }),
    ['validate', alias],
  ],
})
export class ListCapitalCallAction extends Action {
  constructor(private pg: TripRepositoryProvider) {
    super();
  }

  public async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    return await this.pg.search(params);
  }
}
