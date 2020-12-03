import { handler } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';

import { CampaignRepositoryProviderInterfaceResolver } from '../interfaces/CampaignRepositoryProviderInterface';
import { handlerConfig, ResultInterface } from '../shared/policy/templates.contract';
import { alias } from '../shared/policy/templates.schema';

@handler({
  ...handlerConfig,
  middlewares: [
    ['can', ['incentive-campaign.templates']],
    ['validate', alias],
  ],
})
export class TemplatesCampaignAction extends AbstractAction {
  constructor(private campaignRepository: CampaignRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(): Promise<ResultInterface> {
    return this.campaignRepository.getTemplates();
  }
}
