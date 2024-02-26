import { handler } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';
import { internalOnlyMiddlewares } from '@pdc/provider-middleware';
import { IncentiveRepositoryProviderInterfaceResolver } from '../interfaces';
import { handlerConfig } from '@shared/policy/stats.contract';

@handler({
  ...handlerConfig,
  middlewares: [...internalOnlyMiddlewares(handlerConfig.service)],
})
export class StatsAction extends AbstractAction {
  constructor(private incentiveRepository: IncentiveRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(): Promise<void> {
    await this.incentiveRepository.updateIncentiveSum();
  }
}
