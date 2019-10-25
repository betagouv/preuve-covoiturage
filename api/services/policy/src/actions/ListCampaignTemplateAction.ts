import { handler } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';

import { CampaignRepositoryProviderInterfaceResolver } from '../interfaces/CampaignRepositoryProviderInterface';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/policy/listTemplate.contract';
import { ActionMiddleware } from '../shared/common/ActionMiddlewareInterface';
import { alias } from '../shared/policy/create.schema';

@handler(handlerConfig)
export class ListCampaignTemplateAction extends AbstractAction {
  public readonly middlewares: ActionMiddleware[] = [
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
    ['validate', alias],
  ];

  constructor(private campaignRepository: CampaignRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface, _context): Promise<ResultInterface> {
    return this.campaignRepository.findTemplates(params.territory_id);
  }
}
