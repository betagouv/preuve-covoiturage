import { Action as AbstractAction } from '@ilos/core';
import { handler, InitHookInterface, KernelInterfaceResolver } from '@ilos/common';
import { internalOnlyMiddlewares } from '@pdc/provider-middleware';
import { handlerConfig, signature } from '../../shared/observatory/flux/refreshAllFlux.contract';
import { FluxRepositoryInterfaceResolver } from '../../interfaces/FluxRepositoryProviderInterface';

@handler({
  ...handlerConfig,
  middlewares: [...internalOnlyMiddlewares(handlerConfig.service)],
})
export class RefreshAllFluxAction extends AbstractAction implements InitHookInterface {
  constructor(private kernel: KernelInterfaceResolver, private fluxRepository: FluxRepositoryInterfaceResolver) {
    super();
  }

  public async init(): Promise<void> {
    await this.kernel.notify<void>(signature, null, {
      call: {
        user: {},
      },
      channel: {
        service: handlerConfig.service,
        metadata: {
          jobId: 'observatory.RefreshAllFlux.action',
        },
      },
    });
  }

  public async handle(): Promise<void> {
    return this.fluxRepository.refreshAllFlux();
  }
}
