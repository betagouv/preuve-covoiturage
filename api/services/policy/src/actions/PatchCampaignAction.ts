import { handler } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';
import { CampaignInterface } from '@pdc/provider-schema';

import { CampaignRepositoryProviderInterfaceResolver } from '../interfaces/CampaignRepositoryProviderInterface';

@handler({
  service: 'campaign',
  method: 'patch',
})
export class PatchCampaignAction extends AbstractAction {
  public readonly middlewares: (string | [string, any])[] = [
    ['can', ['incentive-campaign.update']],
    ['validate', 'campaign.patch'],
    'validate.retribution',
  ];

  constructor(private campaignRepository: CampaignRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: { _id: string; patch: CampaignInterface }, context): Promise<CampaignInterface> {
    const { _id, patch } = params;
    const territoryId = context.call.user.territory;

    return this.campaignRepository.patchWhereTerritory(_id, territoryId, patch);
  }
}
