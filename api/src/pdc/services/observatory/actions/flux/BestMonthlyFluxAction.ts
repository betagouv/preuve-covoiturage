import { Action as AbstractAction } from '@ilos/core';
import { handler } from '@ilos/common';
import { hasPermissionMiddleware } from '@pdc/providers/middleware';
import { alias } from '@shared/observatory/flux/bestMonthlyFlux.schema';
import { handlerConfig, ResultInterface, ParamsInterface } from '@shared/observatory/flux/bestMonthlyFlux.contract';
import { FluxRepositoryInterfaceResolver } from '../../interfaces/FluxRepositoryProviderInterface';
import { limitNumberParamWithinRange } from '../../helpers/checkParams';

@handler({
  ...handlerConfig,
  middlewares: [hasPermissionMiddleware('common.observatory.stats'), ['validate', alias]],
})
export class BestMonthlyFluxAction extends AbstractAction {
  constructor(private repository: FluxRepositoryInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    params.year = limitNumberParamWithinRange(params.year, 2020, new Date().getFullYear());
    return this.repository.getBestMonthlyFlux(params);
  }
}
