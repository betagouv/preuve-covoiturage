import { handler } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';
import { copyGroupIdAndApplyGroupPermissionMiddlewares } from '@pdc/provider-middleware/dist';

import { IncentiveRepositoryProviderInterfaceResolver } from '../interfaces';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/policy/campaignState.contract';
import { alias } from '../shared/policy/campaignState.schema';

@handler({
  ...handlerConfig,
  middlewares: [
    ...copyGroupIdAndApplyGroupPermissionMiddlewares({
      territory: 'territory.policy.find',
      registry: 'registry.policy.find',
    }),
    ['validate', alias],
  ],
})
export class CampaignStateAction extends AbstractAction {
  constructor(private incentiveRepository: IncentiveRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface, context): Promise<ResultInterface> {
    return this.incentiveRepository.getCampaignState(params._id);
  }
}
