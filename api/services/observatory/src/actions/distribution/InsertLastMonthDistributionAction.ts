import { Action as AbstractAction } from '@ilos/core';
import { handler, InitHookInterface, KernelInterfaceResolver } from '@ilos/common';
import { internalOnlyMiddlewares } from '@pdc/provider-middleware';
import {
  handlerConfig,
  ParamsInterface,
  signature,
} from '../../shared/observatory/distribution/insertMonthlyDistribution.contract';
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

  get currentYear() {
    return new Date().getFullYear();
  }

  get currentMonth() {
    return new Date().getMonth();
  }

  public async init(): Promise<void> {
    await this.kernel.notify<ParamsInterface>(
      signature,
      { year: this.currentYear, month: this.currentMonth },
      {
        channel: {
          service: handlerConfig.service,
          metadata: {
            jobId: 'observatory.InsertMonthlyDistribution.cron',
            repeat: {
              cron: '0 6 8 * *',
            },
          },
        },
      },
    );
  }

  public async handle(params: ParamsInterface): Promise<void> {
    await this.distributionRepository.deleteOneMonthDistribution(params);
    return this.distributionRepository.insertOneMonthDistribution(params);
  }
}
