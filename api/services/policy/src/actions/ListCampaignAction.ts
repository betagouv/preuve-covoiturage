import { handler } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';

import { CampaignRepositoryProviderInterfaceResolver } from '../interfaces/CampaignRepositoryProviderInterface';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/policy/list.contract';
import { ActionMiddleware } from '../shared/common/ActionMiddlewareInterface';

@handler(handlerConfig)
export class ListCampaignAction extends AbstractAction {
  public readonly middlewares: ActionMiddleware[] = [['can', ['incentive-campaign.list']]];

  constructor(private campaignRepository: CampaignRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(_params: ParamsInterface, context): Promise<ResultInterface> {
    return this.campaignRepository.findWhereTerritory(context.call.user.territory);
  }
}
