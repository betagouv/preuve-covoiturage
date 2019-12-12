import { handler } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/policy/apply.contract';
import { ActionMiddleware } from '../shared/common/ActionMiddlewareInterface';
import { PolicyEngine } from '../engine/PolicyEngine';
import {
  IncentiveRepositoryProviderInterfaceResolver,
  CampaignRepositoryProviderInterfaceResolver,
  IncentiveInterface,
} from '../interfaces';

@handler(handlerConfig)
export class ApplyAction extends AbstractAction {
  public readonly middlewares: ActionMiddleware[] = [['channel.service.only', ['carpool']]];

  constructor(
    private campaignRepository: CampaignRepositoryProviderInterfaceResolver,
    private incentiveRepository: IncentiveRepositoryProviderInterfaceResolver,
    private engine: PolicyEngine,
  ) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    // 1. Find applicable campaign for this trip
    const campaigns = await this.campaignRepository.findApplicableCampaigns(params.territories, params.datetime);

    // 2. For each campaign, use policy engine to generate incentive
    for (const campaign of campaigns) {
      const incentives: IncentiveInterface[] = await this.engine.process(params, campaign);
      // 3. Save it to db
      // TODO: add a create many method
      for (const incentive of incentives) {
        await this.incentiveRepository.create(incentive);
      }
    }
  }
}
