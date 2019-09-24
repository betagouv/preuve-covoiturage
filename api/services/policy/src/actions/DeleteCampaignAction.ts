import { handler, InvalidParamsException } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';
import { CampaignInterface } from '@pdc/provider-schema';

import { CampaignRepositoryProviderInterfaceResolver } from '../interfaces/CampaignRepositoryProviderInterface';

@handler({
  service: 'campaign',
  method: 'delete',
})
export class DeleteCampaignAction extends AbstractAction {
  public readonly middlewares: (string | [string, any])[] = [
    [
      'scope.it',
      [
        [],
        [
          (params, context) => {
            if ('territory_id' in params && params.territory_id === context.call.user.territory) {
              return 'incentive-campaign.delete';
            }
          },
        ],
      ],
    ],
    ['validate', 'campaign.delete'],
  ];

  constructor(private campaignRepository: CampaignRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: { _id: string; territory_id: string }): Promise<boolean> {
    await this.campaignRepository.deleteDraft(params._id, params.territory_id);
    return true;
  }
}
