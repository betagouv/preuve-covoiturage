import { handler, InvalidParamsException } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';
import { CampaignInterface } from '@pdc/provider-schema';

import { CampaignRepositoryProviderInterfaceResolver } from '../interfaces/CampaignRepositoryProviderInterface';

@handler({
  service: 'campaign',
  method: 'launch',
})
export class LaunchCampaignAction extends AbstractAction {
  public readonly middlewares: (string | [string, any])[] = [
    ['can', ['incentive-campaign.create']],
    ['validate', 'campaign.launch'],
  ];

  constructor(private campaignRepository: CampaignRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: { _id: string }, context): Promise<CampaignInterface> {
    const territoryId = context.call.user.territory;
    const campaign: CampaignInterface = await this.campaignRepository.findOneWhereTerritory(params._id, territoryId);
    const patch = {
      status: 'active',
    };

    if (campaign.status !== 'draft') {
      throw new InvalidParamsException(`Campaign ${params._id} must be a draft to be launched.`);
    }

    if (campaign.start < new Date()) {
      patch['start'] = new Date();
    }

    return this.campaignRepository.patch(params._id, patch);
  }
}
