import { handler } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';

import { CampaignRepositoryProviderInterfaceResolver } from '../interfaces/CampaignRepositoryProviderInterface';
import { handlerConfig, ResultInterface } from '../shared/policy/templates.contract';
import { alias } from '../shared/policy/templates.schema';
import { ActionMiddleware } from '../shared/common/ActionMiddlewareInterface';

@handler(handlerConfig)
export class TemplatesCampaignAction extends AbstractAction {
  public readonly middlewares: ActionMiddleware[] = [['can', ['incentive-campaign.templates']], ['validate', alias]];

  constructor(private campaignRepository: CampaignRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(): Promise<ResultInterface> {
    return this.campaignRepository.getTemplates();
  }
}
