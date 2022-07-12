import { handler, NotFoundException } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';
import { copyGroupIdAndApplyGroupPermissionMiddlewares } from '@pdc/provider-middleware/dist';

import {
  IncentiveRepositoryProviderInterfaceResolver,
  CampaignRepositoryProviderInterfaceResolver,
} from '../interfaces';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/policy/find.contract';
import { alias } from '../shared/policy/find.schema';

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
  ) {
    super();
  }

  public async handle(params: ParamsInterface, context): Promise<ResultInterface> {
    const campaign =
      params.territory_id === null || params.territory_id === undefined
        ? await this.campaignRepository.find(params._id)
        : await this.campaignRepository.findOneWhereTerritory(params._id, params.territory_id);

    if (!campaign) {
      throw new NotFoundException(`Campaign #${params._id} not found`);
    }

    const state = await this.incentiveRepository.getCampaignStats(campaign._id);
    return {
      ...campaign,
      state,
    };
  }
}
