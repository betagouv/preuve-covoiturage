import { handler } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';
import { internalOnlyMiddlewares } from '@pdc/provider-middleware';
import { PolicyRepositoryProviderInterfaceResolver } from '../interfaces';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/policy/syncMaxAmount.contract';
import { alias } from '../shared/policy/syncMaxAmount.schema';

@handler({
  ...handlerConfig,
  middlewares: [...internalOnlyMiddlewares(handlerConfig.service), ['validate', alias]],
})
export class syncMaxAmountAction extends AbstractAction {
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
      await this.policyRepository.syncMaxAmount(campaign_id);
    }
  }
}
