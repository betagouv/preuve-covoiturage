import { Action as AbstractAction } from '@ilos/core';
import { handler, ContextType } from '@ilos/common';
import { copyFromContextMiddleware, hasPermissionByScopeMiddleware } from '@pdc/provider-middleware';

import { handlerConfig, ParamsInterface, ResultInterface } from '@shared/application/list.contract';
import { alias } from '@shared/application/list.schema';
import { ApplicationRepositoryProviderInterfaceResolver } from '../interfaces/ApplicationRepositoryProviderInterface';

@handler({
  ...handlerConfig,
  middlewares: [
    ['validate', alias],
    copyFromContextMiddleware('call.user.operator_id', 'owner_id'),
    hasPermissionByScopeMiddleware(undefined, ['operator.application.list', 'call.user.operator_id', 'owner_id']),
  ],
})
export class ListApplicationAction extends AbstractAction {
  constructor(private applicationRepository: ApplicationRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    return this.applicationRepository.list({
      ...params,
      owner_service: 'operator',
    });
  }
}
