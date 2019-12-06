import { handler } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';
import { get } from 'lodash';

import { CampaignRepositoryProviderInterfaceResolver } from '../interfaces/CampaignRepositoryProviderInterface';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/policy/list.contract';
import { alias } from '../shared/policy/list.schema';
import { ActionMiddleware } from '../shared/common/ActionMiddlewareInterface';

@handler(handlerConfig)
export class ListCampaignAction extends AbstractAction {
  public readonly middlewares: ActionMiddleware[] = [['can', ['incentive-campaign.list']], ['validate', alias]];
  protected readonly sensitiveRules = ['operator_whitelist_filter'];

  constructor(private campaignRepository: CampaignRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface, context): Promise<ResultInterface> {
    const result = await this.campaignRepository.findWhere(params);
    const userTerritoryId = get(context, 'call.user.territory_id');

    if (!userTerritoryId || params.territory_id !== userTerritoryId) {
      return result.map((c) => this.removeSensitiveRules(c));
    }

    return result;
  }

  protected removeSensitiveRules(campaign) {
    return {
      ...campaign,
      global_rules: Array.isArray(campaign.global_rules)
        ? campaign.global_rules.filter((r) => this.sensitiveRules.indexOf(r.slug) < 0)
        : [],
      rules: Array.isArray(campaign.global_rules)
        ? campaign.rules.filter((r) => this.sensitiveRules.indexOf(r.slug) < 0)
        : [],
    };
  }
}
