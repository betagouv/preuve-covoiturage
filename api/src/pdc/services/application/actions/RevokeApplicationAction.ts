import { Action as AbstractAction } from '@ilos/core';
import { handler, ContextType } from '@ilos/common';
import { copyFromContextMiddleware, hasPermissionByScopeMiddleware } from '@pdc/providers/middleware';

import { handlerConfig, ParamsInterface, ResultInterface } from '@shared/application/revoke.contract';
import { alias } from '@shared/application/revoke.schema';
import { ApplicationRepositoryProviderInterfaceResolver } from '../interfaces/ApplicationRepositoryProviderInterface';

@handler({
  ...handlerConfig,
  middlewares: [
    ['validate', alias],
    copyFromContextMiddleware('call.user.operator_id', 'owner_id'),
    hasPermissionByScopeMiddleware(undefined, ['operator.application.revoke', 'call.user.operator_id', 'owner_id']),
  ],
})
export class RevokeApplicationAction extends AbstractAction {
  constructor(private applicationRepository: ApplicationRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    await this.applicationRepository.revoke({
      ...params,
      owner_service: 'operator',
    });
  }
}
