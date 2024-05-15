import { Action as AbstractAction } from '@ilos/core';
import { handler } from '@ilos/common';
import { hasPermissionMiddleware } from '@pdc/providers/middleware';

import { alias } from '@shared/observatory/incentiveCampaigns/campaigns.schema';
import { handlerConfig, ResultInterface, ParamsInterface } from '@shared/observatory/incentiveCampaigns/campaigns.contract';
import { IncentiveCampaignsRepositoryInterfaceResolver } from '../../interfaces/IncentiveCampaignsRepositoryProviderInterface';

@handler({
  ...handlerConfig,
  middlewares: [hasPermissionMiddleware('common.observatory.stats'), ['validate', alias]],
})
export class CampaignsAction extends AbstractAction {
  constructor(private repository: IncentiveCampaignsRepositoryInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    return this.repository.getCampaigns(params);
  }
}
