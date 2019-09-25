import { handler } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';
import { CampaignInterface } from '@pdc/provider-schema';

import { CampaignRepositoryProviderInterfaceResolver } from '../interfaces/CampaignRepositoryProviderInterface';

@handler({
  service: 'campaign',
  method: 'listTemplate',
})
export class ListCampaignTemplateAction extends AbstractAction {
  public readonly middlewares: (string | [string, any])[] = [
    [
      'scope.it',
      [
        [],
        [
          (params, context) => {
            if (
              'territory_id' in params &&
              (params.territory_id === context.call.user.territory || params.territory_id === null)
            ) {
              return 'incentive-campaign.list';
            }
          },
        ],
      ],
    ],
    ['validate', 'campaign.listTemplate'],
  ];

  constructor(private campaignRepository: CampaignRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: { territory_id: string | null }, _context): Promise<CampaignInterface[]> {
    return this.campaignRepository.findTemplates(params.territory_id);
  }
}
