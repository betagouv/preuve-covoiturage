import { handler } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';
import { hasPermissionMiddleware } from '@pdc/provider-middleware';

import { PolicyRepositoryProviderInterfaceResolver } from '../interfaces/PolicyRepositoryProviderInterface';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/policy/list.contract';
import { alias } from '../shared/policy/list.schema';

@handler({
  ...handlerConfig,
  middlewares: [hasPermissionMiddleware('common.policy.list'), ['validate', alias]],
})
export class ListCampaignAction extends AbstractAction {
  protected readonly sensitiveRules = ['operator_whitelist_filter'];

  constructor(private repository: PolicyRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    const result = await this.repository.findWhere(params);
    return result;
  }
}
