import { Action as AbstractAction } from '@ilos/core';
import { handler } from '@ilos/common';
import { hasPermissionMiddleware } from '@pdc/provider-middleware';

import { alias } from '../shared/observatory/monthlyFlux.schema';
import { handlerConfig, ResultInterface, ParamsInterface } from '../shared/observatory/monthlyFlux.contract';
import { FluxRepositoryInterfaceResolver } from '../interfaces/FluxRepositoryProviderInterface';

@handler({
  ...handlerConfig,
  middlewares: [
    hasPermissionMiddleware('common.observatory.stats'),
    ['validate', alias],
  ],
})
export class MonthlyFluxAction extends AbstractAction {
  constructor(private fluxRepository: FluxRepositoryInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    return this.fluxRepository.monthlyFlux(params);
  }
}
