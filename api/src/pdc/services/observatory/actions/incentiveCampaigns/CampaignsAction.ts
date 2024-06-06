import { Action as AbstractAction } from '/ilos/core/index.ts';
import { handler } from '/ilos/common/index.ts';
import { hasPermissionMiddleware } from '/pdc/providers/middleware/index.ts';

import { alias } from '/shared/observatory/incentiveCampaigns/campaigns.schema.ts';
import { handlerConfig, ResultInterface, ParamsInterface } from '/shared/observatory/incentiveCampaigns/campaigns.contract.ts';
import { IncentiveCampaignsRepositoryInterfaceResolver } from '../../interfaces/IncentiveCampaignsRepositoryProviderInterface.ts';

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
