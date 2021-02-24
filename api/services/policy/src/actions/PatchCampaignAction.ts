import { handler } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';
import { copyGroupIdAndApplyGroupPermissionMiddlewares } from '@pdc/provider-middleware/dist';

import { validateRuleParametersMiddleware } from '../middlewares/ValidateRuleParametersMiddleware';
import { CampaignRepositoryProviderInterfaceResolver } from '../interfaces/CampaignRepositoryProviderInterface';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/policy/patch.contract';
import { alias } from '../shared/policy/patch.schema';

@handler({
  ...handlerConfig,
  middlewares: [
    ['validate', alias],
    ...copyGroupIdAndApplyGroupPermissionMiddlewares({
      territory: 'territory.policy.patch',
      registry: 'registry.policy.patch',
    }),
    validateRuleParametersMiddleware(),
  ],
})
export class PatchCampaignAction extends AbstractAction {
  constructor(private campaignRepository: CampaignRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface, context): Promise<ResultInterface> {
    const { _id, territory_id, patch } = params;

    return this.campaignRepository.patchWhereTerritory(_id, territory_id, patch);
  }
}
