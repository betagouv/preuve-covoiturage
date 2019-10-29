import { handler, InvalidParamsException } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';
import { CampaignInterface } from '@pdc/provider-schema';

import { CampaignRepositoryProviderInterfaceResolver } from '../interfaces/CampaignRepositoryProviderInterface';

@handler({
  service: 'campaign',
  method: 'create',
})
export class CreateCampaignAction extends AbstractAction {
  public readonly middlewares: (string | [string, any])[] = [
    [
      'scope.it',
      [
        [],
        [
          (params, context) => {
            if ('territory_id' in params && params.territory_id === context.call.user.territory) {
              return 'incentive-campaign.create';
            }
          },
        ],
      ],
    ],
    ['validate', 'campaign.create'],
    'validate.rules',
  ];

  constructor(private campaignRepository: CampaignRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: CampaignInterface): Promise<CampaignInterface> {
    if (params.parent_id) {
      try {
        this.campaignRepository.find(params.parent_id);
      } catch (e) {
        throw new InvalidParamsException(`Parent ${params.parent_id} does not exist`);
      }
    }

    return this.campaignRepository.create(params);
  }
}
