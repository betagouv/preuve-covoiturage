import { handler } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';

import { CampaignRepositoryProviderInterfaceResolver } from '../interfaces/CampaignRepositoryProviderInterface';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/policy/delete.contract';
import { alias } from '../shared/policy/delete.schema';

@handler({
  ...handlerConfig,
  middlewares: [
    [
      'scope.it',
      [
        ['incentive-campaign.delete'],
        [
          (params, context): string => {
            if ('territory_id' in params && params.territory_id === context.call.user.territory_id) {
              return 'incentive-campaign.delete';
            }
          },
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
