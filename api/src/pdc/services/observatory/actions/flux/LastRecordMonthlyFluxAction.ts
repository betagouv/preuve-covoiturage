import { Action as AbstractAction } from '/ilos/core/index.ts';
import { handler } from '/ilos/common/index.ts';
import { hasPermissionMiddleware } from '/pdc/providers/middleware/index.ts';
import { handlerConfig, ResultInterface } from '/shared/observatory/flux/lastRecordMonthlyFlux.contract.ts';
import { FluxRepositoryInterfaceResolver } from '../../interfaces/FluxRepositoryProviderInterface.ts';

@handler({
  ...handlerConfig,
  middlewares: [hasPermissionMiddleware('common.observatory.stats')],
})
export class LastRecordMonthlyFluxAction extends AbstractAction {
  constructor(private fluxRepository: FluxRepositoryInterfaceResolver) {
    super();
  }

  public async handle(): Promise<ResultInterface> {
    return this.fluxRepository.lastRecordMonthlyFlux();
  }
}
