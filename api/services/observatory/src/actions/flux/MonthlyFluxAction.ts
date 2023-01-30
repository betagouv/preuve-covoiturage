import { Action as AbstractAction } from '@ilos/core';
import { handler } from '@ilos/common';
import { hasPermissionMiddleware } from '@pdc/provider-middleware';

import { alias } from '../../shared/observatory/flux/monthlyFlux.schema';
import { handlerConfig, ResultInterface, ParamsInterface } from '../../shared/observatory/flux/monthlyFlux.contract';
import { FluxRepositoryInterfaceResolver } from '../../interfaces/FluxRepositoryProviderInterface';

@handler({
  ...handlerConfig,
  middlewares: [hasPermissionMiddleware('common.observatory.stats'), ['validate', alias]],
})
export class MonthlyFluxAction extends AbstractAction {
  constructor(private repository: FluxRepositoryInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    return this.repository.getMonthlyFlux(params);
  }
}
