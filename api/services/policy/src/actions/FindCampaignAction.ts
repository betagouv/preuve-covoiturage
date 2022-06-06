import { handler, NotFoundException } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';
import { copyGroupIdAndApplyGroupPermissionMiddlewares } from '@pdc/provider-middleware/dist';

import {
  IncentiveRepositoryProviderInterfaceResolver,
  CampaignRepositoryProviderInterfaceResolver,
} from '../interfaces';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/policy/find.contract';
import { alias } from '../shared/policy/find.schema';
import { MutateCampaignInseesFilter as MutateCampaignInseesFilter } from './campaign/MutateCampaignInseesFilter';

@handler({
  ...handlerConfig,
  middlewares: [
    ...copyGroupIdAndApplyGroupPermissionMiddlewares({
      territory: 'territory.policy.find',
      registry: 'registry.policy.find',
    }),
    ['validate', alias],
  ],
})
export class FindCampaignAction extends AbstractAction {
  constructor(
    private campaignRepository: CampaignRepositoryProviderInterfaceResolver,
    private incentiveRepository: IncentiveRepositoryProviderInterfaceResolver,
    private mutateCampaignInseesFilter: MutateCampaignInseesFilter,
  ) {
    super();
  }

  public async handle(params: ParamsInterface, context): Promise<ResultInterface> {
    // Find
    const campaign =
      params.territory_id === null || params.territory_id === undefined
        ? await this.campaignRepository.find(params._id)
        : await this.campaignRepository.findOneWhereTerritory(params._id, params.territory_id);

    if (!campaign) {
      throw new NotFoundException(`Campaign #${params._id} not found`);
    }

    // Mutate global_rules
    campaign.global_rules = await this.mutateCampaignInseesFilter.call(campaign.global_rules);

    // Enhance
    const state = await this.incentiveRepository.getCampaignState(campaign._id);

    // Return
    return {
      ...campaign,
      state,
    };
  }
}
