import { handler } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';
import { CampaignInterface } from '@pdc/provider-schema';

import { CampaignRepositoryProviderInterfaceResolver } from '../interfaces/CampaignRepositoryProviderInterface';

@handler({
  service: 'campaign',
  method: 'listTemplate',
})
export class ListCampaignTemplateAction extends AbstractAction {
  public readonly middlewares: (string | [string, any])[] = [['can', ['incentive-campaign.list']]];

  constructor(private campaignRepository: CampaignRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(_params, _context): Promise<CampaignInterface[]> {
    return this.campaignRepository.findTemplates();
  }
}
