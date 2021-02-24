import { handler, InvalidParamsException } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';
import { copyGroupIdAndApplyGroupPermissionMiddlewares } from '@pdc/provider-middleware';

import { CampaignRepositoryProviderInterfaceResolver } from '../interfaces/CampaignRepositoryProviderInterface';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/policy/launch.contract';
import { CampaignInterface } from '../shared/policy/common/interfaces/CampaignInterface';
import { alias } from '../shared/policy/launch.schema';

@handler({
  ...handlerConfig,
  middlewares: [
    ['validate', alias],
    ...copyGroupIdAndApplyGroupPermissionMiddlewares({ territory: 'territory.policy.launch' }),
  ],
})
export class LaunchCampaignAction extends AbstractAction {
  constructor(private campaignRepository: CampaignRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface, context): Promise<ResultInterface> {
    const campaign: CampaignInterface & { start_date: Date } = await this.campaignRepository.findOneWhereTerritory(
      params._id,
      params.territory_id,
    );

    const patch = {
      status: 'active',
    };

    if (campaign.status !== 'draft') {
      throw new InvalidParamsException(`Campaign ${params._id} must be a draft to be launched.`);
    }

    if (campaign.start_date < new Date()) {
      patch['start_date'] = new Date();
    }

    return this.campaignRepository.patch(params._id, patch);
  }
}
