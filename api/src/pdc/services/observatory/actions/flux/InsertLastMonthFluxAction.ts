import { handler } from '@/ilos/common/index.ts';
import { Action as AbstractAction } from '@/ilos/core/index.ts';
import { internalOnlyMiddlewares } from '@/pdc/providers/middleware/index.ts';
import { FluxRepositoryInterfaceResolver } from '../../interfaces/FluxRepositoryProviderInterface.ts';
import { handlerConfig, ParamsInterface } from '@/shared/observatory/flux/insertMonthlyFlux.contract.ts';

@handler({
  ...handlerConfig,
  middlewares: [...internalOnlyMiddlewares(handlerConfig.service)],
})
export class InsertLastMonthFluxAction extends AbstractAction {
  constructor(private fluxRepository: FluxRepositoryInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<void> {
    await this.fluxRepository.deleteOneMonthFlux(params);
    return this.fluxRepository.insertOneMonthFlux(params);
  }
}
