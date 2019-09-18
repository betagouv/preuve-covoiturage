import { handler, InvalidParamsException } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';
import { CampaignInterface } from '@pdc/provider-schema';

import { CampaignRepositoryProviderInterfaceResolver } from '../interfaces/CampaignRepositoryProviderInterface';

@handler({
  service: 'campaign',
  method: 'list',
})
export class ListCampaignAction extends AbstractAction {
  public readonly middlewares: (string | [string, any])[] = [
    ['can', ['incentive-campaign.list']],
    ['validate', 'campaign.list'],
  ];

  constructor(private campaignRepository: CampaignRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: { status: string }, context): Promise<CampaignInterface[]> {
    if (params.status) {
      return this.campaignRepository.findTemplates();
    }

    return this.campaignRepository.findWhereTerritory(context.call.user.territory);
  }
}
