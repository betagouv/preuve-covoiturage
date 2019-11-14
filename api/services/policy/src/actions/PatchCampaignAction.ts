import { handler } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';

import { CampaignRepositoryProviderInterfaceResolver } from '../interfaces/CampaignRepositoryProviderInterface';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/policy/patch.contract';
import { ActionMiddleware } from '../shared/common/ActionMiddlewareInterface';
import { alias } from '../shared/policy/patch.schema';

@handler(handlerConfig)
export class PatchCampaignAction extends AbstractAction {
  public readonly middlewares: ActionMiddleware[] = [
    ['can', ['incentive-campaign.update']],
    ['validate', alias],
    'validate.rules',
  ];

  constructor(private campaignRepository: CampaignRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface, context): Promise<ResultInterface> {
    const { _id, patch } = params;
    const territoryId = context.call.user.territory_id;

    return this.campaignRepository.patchWhereTerritory(_id, territoryId, patch);
  }
}
