import { handler } from '@/ilos/common/index.ts';
import { Action as AbstractAction } from '@/ilos/core/index.ts';
import { internalOnlyMiddlewares } from '@/pdc/providers/middleware/index.ts';
import { PolicyRepositoryProviderInterfaceResolver } from '../interfaces/index.ts';
import { handlerConfig, ParamsInterface, ResultInterface } from '@/shared/policy/syncIncentiveSum.contract.ts';
import { alias } from '@/shared/policy/syncIncentiveSum.schema.ts';

@handler({
  ...handlerConfig,
  middlewares: [...internalOnlyMiddlewares(handlerConfig.service), ['validate', alias]],
})
export class syncIncentiveSumAction extends AbstractAction {
  constructor(private policyRepository: PolicyRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    let list: number[] = [];

    if ('campaigns' in params && params.campaigns.length) {
      list = [...params.campaigns];
    } else {
      list = await this.policyRepository.listApplicablePoliciesId();
    }

    for (const campaign_id of list) {
      await this.policyRepository.syncIncentiveSum(campaign_id);
    }
  }
}
