import { handler } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';

import { CampaignRepositoryProviderInterfaceResolver } from '../interfaces/CampaignRepositoryProviderInterface';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/policy/find.contract';
import { ActionMiddleware } from '../shared/common/ActionMiddlewareInterface';
import { alias } from '../shared/policy/find.schema';

@handler(handlerConfig)
export class FindCampaignAction extends AbstractAction {
  public readonly middlewares: ActionMiddleware[] = [
    ['can', ['incentive-campaign.read']],
    ['validate', alias],
  ];

  constructor(private campaignRepository: CampaignRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface, context): Promise<ResultInterface> {
    const territoryId = context.call.user.territory_id;

    return this.campaignRepository.findOneWhereTerritory(params._id, territoryId);
  }
}
