import { Action as AbstractAction } from '@ilos/core';
import { handler } from '@ilos/common';
import { hasPermissionMiddleware } from '@pdc/provider-middleware';
import { handlerConfig, ResultInterface } from '../../shared/observatory/flux/lastRecordMonthlyFlux.contract';
import { FluxRepositoryInterfaceResolver } from '../../interfaces/FluxRepositoryProviderInterface';

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
