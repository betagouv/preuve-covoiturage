import { Action as AbstractAction } from '@ilos/core';
import { handler } from '@ilos/common';
import { hasPermissionMiddleware } from '@pdc/providers/middleware';

import { alias } from '@shared/observatory/incentiveCampaigns/AllCampaigns.schema';
import { handlerConfig, ResultInterface, ParamsInterface } from '@shared/observatory/incentiveCampaigns/AllCampaigns.contract';
import { IncentiveCampaignsRepositoryInterfaceResolver } from '../../interfaces/IncentiveCampaignsRepositoryProviderInterface';
import { limitNumberParamWithinRange } from '../../helpers/checkParams';

@handler({
  ...handlerConfig,
  middlewares: [hasPermissionMiddleware('common.observatory.stats'), ['validate', alias]],
})
export class AllCampaignsAction extends AbstractAction {
  constructor(private repository: IncentiveCampaignsRepositoryInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    //params.year = limitNumberParamWithinRange(params.year, 2022, new Date().getFullYear());
    return this.repository.getAllCampaigns(params);
  }
}
