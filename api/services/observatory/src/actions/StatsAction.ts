import { Action as AbstractAction } from '@ilos/core';
import { handler } from '@ilos/common';
import { hasPermissionMiddleware } from '@pdc/provider-middleware';

import { alias } from '../shared/observatory/stats.schema';
import { handlerConfig, ResultInterface, ParamsInterface } from '../shared/observatory/stats.contract';
import { ObservatoryRepositoryInterfaceResolver } from '../providers/ObservatoryRepositoryProvider';

@handler({
  ...handlerConfig,
  middlewares: [['validate', alias], hasPermissionMiddleware('common.observatory.stats')],
})
export class StatsAction extends AbstractAction {
  constructor(private pg: ObservatoryRepositoryInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    return this.pg.stats(params);
  }
}