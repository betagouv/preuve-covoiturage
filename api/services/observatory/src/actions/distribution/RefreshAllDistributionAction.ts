import { Action as AbstractAction } from '@ilos/core';
import { handler, InitHookInterface, KernelInterfaceResolver } from '@ilos/common';
import { internalOnlyMiddlewares } from '@pdc/provider-middleware';
import { handlerConfig, signature } from '../../shared/observatory/distribution/refreshAllDistribution.contract';
import { DistributionRepositoryInterfaceResolver } from '../../interfaces/DistributionRepositoryProviderInterface';

@handler({
  ...handlerConfig,
  middlewares: [...internalOnlyMiddlewares(handlerConfig.service)],
})
export class RefreshAllDistributionAction extends AbstractAction implements InitHookInterface {
  constructor(
    private kernel: KernelInterfaceResolver,
    private distributionRepository: DistributionRepositoryInterfaceResolver,
  ) {
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
          jobId: 'observatory.RefreshAllDistribution.action',
        },
      },
    });
  }

  public async handle(): Promise<void> {
    return this.distributionRepository.refreshAllDistribution();
  }
}
