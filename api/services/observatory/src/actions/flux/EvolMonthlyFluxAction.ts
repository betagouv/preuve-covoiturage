import { Action as AbstractAction } from '@ilos/core';
import { handler } from '@ilos/common';
import { hasPermissionMiddleware } from '@pdc/provider-middleware';

import { alias } from '../../shared/observatory/flux/evolMonthlyFlux.schema';
import {
  handlerConfig,
  ResultInterface,
  ParamsInterface,
} from '../../shared/observatory/flux/evolMonthlyFlux.contract';
import { FluxRepositoryInterfaceResolver } from '../../interfaces/FluxRepositoryProviderInterface';

@handler({
  ...handlerConfig,
  middlewares: [hasPermissionMiddleware('common.observatory.stats'), ['validate', alias]],
})
export class EvolMonthlyFluxAction extends AbstractAction {
  constructor(private repository: FluxRepositoryInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    return this.repository.getEvolMonthlyFlux(params);
  }
}
