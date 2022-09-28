import { handler } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';
import { copyFromContextMiddleware, hasPermissionMiddleware } from '@pdc/provider-middleware';

import { PolicyRepositoryProviderInterfaceResolver } from '../interfaces';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/policy/list.contract';
import { alias } from '../shared/policy/list.schema';

@handler({
  ...handlerConfig,
  middlewares: [
    hasPermissionMiddleware('common.policy.list'),
    copyFromContextMiddleware('call.user.territory_id', 'territory_id'),
    ['validate', alias],
  ],
})
export class ListAction extends AbstractAction {
  protected readonly sensitiveRules = ['operator_whitelist_filter'];

  constructor(private repository: PolicyRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    const result = await this.repository.findWhere(params);
    return result;
  }
}
