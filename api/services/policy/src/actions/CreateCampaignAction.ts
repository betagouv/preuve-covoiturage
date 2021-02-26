import { handler, InvalidParamsException } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';
import { validateDateMiddleware, copyGroupIdAndApplyGroupPermissionMiddlewares } from '@pdc/provider-middleware/dist';
import { validateRuleParametersMiddleware } from '../middlewares/ValidateRuleParametersMiddleware';

import { CampaignRepositoryProviderInterfaceResolver } from '../interfaces/CampaignRepositoryProviderInterface';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/policy/create.contract';
import { alias } from '../shared/policy/create.schema';

@handler({
  ...handlerConfig,
  middlewares: [
    ...copyGroupIdAndApplyGroupPermissionMiddlewares({
      territory: 'territory.policy.create',
      registry: 'registry.policy.create',
    }),
    ['validate', alias],
    validateRuleParametersMiddleware(),
    validateDateMiddleware({
      startPath: 'start_date',
      endPath: 'end_date',
      minStart: () => new Date(),
    }),
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
