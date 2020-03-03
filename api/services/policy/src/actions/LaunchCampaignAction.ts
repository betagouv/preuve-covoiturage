import { handler, InvalidParamsException } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';

import { CampaignRepositoryProviderInterfaceResolver } from '../interfaces/CampaignRepositoryProviderInterface';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/policy/launch.contract';
import { CampaignInterface } from '../shared/policy/common/interfaces/CampaignInterface';
import { ActionMiddleware } from '../shared/common/ActionMiddlewareInterface';
import { alias } from '../shared/policy/launch.schema';

@handler(handlerConfig)
export class LaunchCampaignAction extends AbstractAction {
  public readonly middlewares: ActionMiddleware[] = [
    ['can', ['incentive-campaign.create', 'incentive-campaign.launch']],
    ['validate', alias],
  ];

  constructor(private campaignRepository: CampaignRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface, context): Promise<ResultInterface> {
    const territoryId = context.call.user.territory_id;
    const campaign: CampaignInterface & { start_date: Date } = await this.campaignRepository.findOneWhereTerritory(
      params._id,
      territoryId,
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
