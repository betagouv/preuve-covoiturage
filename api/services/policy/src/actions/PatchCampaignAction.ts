import { handler } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';

import { CampaignRepositoryProviderInterfaceResolver } from '../interfaces/CampaignRepositoryProviderInterface';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/policy/patch.contract';
import { alias } from '../shared/policy/patch.schema';

@handler({
  ...handlerConfig,
  middlewares: [['can', ['incentive-campaign.update']], ['validate', alias], 'validate.rules'],
})
export class PatchCampaignAction extends AbstractAction {
  constructor(private campaignRepository: CampaignRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface, context): Promise<ResultInterface> {
    const { _id, patch } = params;
    const territoryId = context.call.user.territory_id;

    return this.campaignRepository.patchWhereTerritory(_id, territoryId, patch);
  }
}
