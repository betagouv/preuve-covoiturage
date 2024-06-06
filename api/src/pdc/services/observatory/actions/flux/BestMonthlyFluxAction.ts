import { Action as AbstractAction } from '@/ilos/core/index.ts';
import { handler } from '@/ilos/common/index.ts';
import { hasPermissionMiddleware } from '@/pdc/providers/middleware/index.ts';
import { alias } from '@/shared/observatory/flux/bestMonthlyFlux.schema.ts';
import { handlerConfig, ResultInterface, ParamsInterface } from '@/shared/observatory/flux/bestMonthlyFlux.contract.ts';
import { FluxRepositoryInterfaceResolver } from '../../interfaces/FluxRepositoryProviderInterface.ts';
import { limitNumberParamWithinRange } from '../../helpers/checkParams.ts';

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
