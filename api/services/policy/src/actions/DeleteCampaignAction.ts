import { handler } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';

import { CampaignRepositoryProviderInterfaceResolver } from '../interfaces/CampaignRepositoryProviderInterface';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/policy/delete.contract';
import { alias } from '../shared/policy/delete.schema';

@handler({
  ...handlerConfig,
  middlewares: [
    [
      'has_permission_by_scope',
      [
        'incentive-campaign.delete',
        [
          [
            'incentive-campaign.delete',
            'call.user.territory_id',
            'territory_id',
          ],
        ],
      ],
    ],
    ['validate', alias],
  ],
})
export class DeleteCampaignAction extends AbstractAction {
  constructor(private campaignRepository: CampaignRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    await this.campaignRepository.deleteDraftOrTemplate(params._id, params.territory_id);
    return true;
  }
}
