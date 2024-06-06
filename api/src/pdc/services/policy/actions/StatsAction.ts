import { handler } from '@/ilos/common/index.ts';
import { Action as AbstractAction } from '@/ilos/core/index.ts';
import { internalOnlyMiddlewares } from '@/pdc/providers/middleware/index.ts';
import { IncentiveRepositoryProviderInterfaceResolver } from '../interfaces/index.ts';
import { handlerConfig } from '@/shared/policy/stats.contract.ts';

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
