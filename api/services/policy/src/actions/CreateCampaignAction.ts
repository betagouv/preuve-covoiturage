import { handler, InvalidParamsException } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';

import { CampaignRepositoryProviderInterfaceResolver } from '../interfaces/CampaignRepositoryProviderInterface';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/policy/create.contract';
import { alias } from '../shared/policy/create.schema';

@handler({
  ...handlerConfig,
  middlewares: [
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
    ['validate.date', ['', new Date()]],
  ],
})
export class CreateCampaignAction extends AbstractAction {
  constructor(private campaignRepository: CampaignRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    if (params.parent_id) {
      try {
        await this.campaignRepository.find(params.parent_id);
      } catch (e) {
        throw new InvalidParamsException(`Parent ${params.parent_id} does not exist`);
      }
    }

    return this.campaignRepository.create(params);
  }
}
