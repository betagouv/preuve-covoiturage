import { Action as AbstractAction } from '@ilos/core';
import { handler, InitHookInterface, KernelInterfaceResolver } from '@ilos/common';
import { internalOnlyMiddlewares } from '@pdc/provider-middleware';
import { handlerConfig, signature } from '../../shared/observatory/distribution/insertLastMonthDistribution.contract';
import { DistributionRepositoryInterfaceResolver } from '../../interfaces/DistributionRepositoryProviderInterface';

@handler({
  ...handlerConfig,
  middlewares: [...internalOnlyMiddlewares(handlerConfig.service)],
})
export class InsertLastMonthDistributionAction extends AbstractAction implements InitHookInterface {
  constructor(
    private kernel: KernelInterfaceResolver,
    private distributionRepository: DistributionRepositoryInterfaceResolver,
  ) {
    super();
  }

  public async init(): Promise<void> {
    await this.kernel.notify<void>(signature, null, {
      channel: {
        service: handlerConfig.service,
        metadata: {
          jobId: 'observatory.InsertMonthlyDistribution.cron',
          repeat: {
            cron: '0 6 8 * *',
          },
        },
      },
    });
  }

  public async handle(): Promise<void> {
    return this.distributionRepository.insertLastMonthDistribution();
  }
}
