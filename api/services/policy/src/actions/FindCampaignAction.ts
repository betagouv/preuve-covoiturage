import { handler } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';

import {
  IncentiveRepositoryProviderInterfaceResolver,
  CampaignRepositoryProviderInterfaceResolver,
} from '../interfaces';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/policy/find.contract';
import { ActionMiddleware } from '../shared/common/ActionMiddlewareInterface';
import { alias } from '../shared/policy/find.schema';

@handler(handlerConfig)
export class FindCampaignAction extends AbstractAction {
  public readonly middlewares: ActionMiddleware[] = [
    [
      'scope.it',
      [
        [],
        [
          (params, context): string => {
            if ('territory_id' in params && params.territory_id === context.call.user.territory_id) {
              return 'incentive-campaign.read';
            }
          },
        ],
      ],
    ],
    ['validate', alias],
  ];

  constructor(
    private campaignRepository: CampaignRepositoryProviderInterfaceResolver,
    private incentiveRepository: IncentiveRepositoryProviderInterfaceResolver,
  ) {
    super();
  }

  public async handle(params: ParamsInterface, context): Promise<ResultInterface> {
    const campaign =
      params.territory_id !== undefined
        ? await this.campaignRepository.findOneWhereTerritory(params._id, params.territory_id)
        : await this.campaignRepository.find(params._id);

    const state = await this.incentiveRepository.getCampaignState(campaign._id);
    return {
      ...campaign,
      state,
    };
  }
}
