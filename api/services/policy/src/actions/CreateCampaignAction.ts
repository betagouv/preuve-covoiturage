import { handler, InvalidParamsException } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';

import { CampaignRepositoryProviderInterfaceResolver } from '../interfaces/CampaignRepositoryProviderInterface';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/policy/create.contract';
import { ActionMiddleware } from '../shared/common/ActionMiddlewareInterface';
import { alias } from '../shared/policy/create.schema';

@handler(handlerConfig)
export class CreateCampaignAction extends AbstractAction {
  public readonly middlewares: ActionMiddleware[] = [
    [
      'scope.it',
      [
        [],
        [
          (params, context): string => {
            if ('territory_id' in params && params.territory_id === context.call.user.territory_id) {
              return 'incentive-campaign.create';
            }
          },
        ],
      ],
    ],
    ['validate', alias],
    'validate.rules',
  ];

  constructor(private campaignRepository: CampaignRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
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
