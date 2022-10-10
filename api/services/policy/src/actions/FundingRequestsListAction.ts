import { Action } from '@ilos/core';
import { ContextType, handler, NotFoundException } from '@ilos/common';
import { copyGroupIdAndApplyGroupPermissionMiddlewares } from '@pdc/provider-middleware';
import { handlerConfig, ParamsInterface, ResultsInterface } from '../shared/policy/fundingRequestsList.contract';
import { PolicyRepositoryProvider } from '../providers/PolicyRepositoryProvider';
import { FundingRequestsRepositoryProviderInterfaceResolver } from '../interfaces';
import { InvalidParamsException } from '@ilos/common/dist';

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
    let operators = await this.policyProvider.activeOperators(campaign_id);

    if (operator_id) {
      if (operators.indexOf(operator_id) < 0) {
        throw new InvalidParamsException(`No operator (${operator_id}) found on campaign (${campaign_id})`);
      }

      // override the list of operators with the current one
      operators = [operator_id];
    }

    // curry operators filter
    // find policies, enrich and filter by operator
    const opsFilter = this.frRepository.operatorsFilter(operators);
    const cmpFilter = this.frRepository.campaignsFilter([campaign_id]);

    return (await this.frRepository.enrich(await this.frRepository.findByCampaign(campaign)))
      .filter(cmpFilter)
      .filter(opsFilter);
  }
}
