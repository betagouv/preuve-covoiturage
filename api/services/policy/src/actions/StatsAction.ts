import { handler, KernelInterfaceResolver } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';
import { internalOnlyMiddlewares } from '@pdc/provider-middleware/dist';

import { IncentiveRepositoryProviderInterfaceResolver } from '../interfaces';
import { handlerConfig, signature } from '../shared/policy/stats.contract';

@handler({
  ...handlerConfig,
  middlewares: [...internalOnlyMiddlewares(handlerConfig.service)],
})
export class StatsAction extends AbstractAction {
  constructor(
    private incentiveRepository: IncentiveRepositoryProviderInterfaceResolver,
    private kernel: KernelInterfaceResolver,
  ) {
    super();
  }

  async init(): Promise<void> {
    await this.kernel.notify<{}>(
      signature,
      {},
      {
        call: {
          user: {},
        },
        channel: {
          service: handlerConfig.service,
          metadata: {
            repeat: {
              cron: '0 7 * * *',
            },
            jobId: 'policy.update_policy_incentive_sum',
          },
        },
      },
    );
  }

  public async handle(): Promise<void> {
    // return await this.incentiveRepository.updateIncentiveSum();
  }
}
