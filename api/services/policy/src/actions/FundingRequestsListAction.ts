import { ContextType, handler, NotFoundException } from '@ilos/common';
import { Action } from '@ilos/core';
import { copyGroupIdAndApplyGroupPermissionMiddlewares } from '@pdc/provider-middleware';
import { FundingRequestsRepositoryProviderInterfaceResolver } from '../interfaces';
import { PolicyRepositoryProvider } from '../providers/PolicyRepositoryProvider';
import { handlerConfig, ParamsInterface, ResultsInterface } from '../shared/policy/fundingRequestsList.contract';

@handler({
  ...handlerConfig,
  middlewares: [
    ...copyGroupIdAndApplyGroupPermissionMiddlewares({
      territory: 'territory.policy.fundingRequestsList',
      operator: 'operator.policy.fundingRequestsList',
      registry: 'registry.policy.fundingRequestsList',
    }),
  ],
})
export class FundingRequestsListAction extends Action {
  constructor(
    private frRepository: FundingRequestsRepositoryProviderInterfaceResolver,
    private policyProvider: PolicyRepositoryProvider,
  ) {
    super();
  }

  public async handle(params: ParamsInterface, context: ContextType): Promise<ResultsInterface> {
    const { campaign_id, operator_id } = params;

    if (!campaign_id) {
      throw new NotFoundException(`Could not find campaign ${campaign_id}`);
    }

    const campaign = await this.policyProvider.find(campaign_id);

    // curry operators and campaign filters
    // find policies, enrich and filter by operator
    const opsFilter = this.frRepository.operatorsFilter(operator_id ? [operator_id] : []);
    const cmpFilter = this.frRepository.campaignsFilter([campaign_id]);

    return (await this.frRepository.enrich(await this.frRepository.findByCampaign(campaign)))
      .filter(cmpFilter)
      .filter(opsFilter);
  }
}
