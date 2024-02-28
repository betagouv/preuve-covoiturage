import { handler, ContextType } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';
import { copyFromContextMiddleware, hasPermissionByScopeMiddleware } from '@pdc/providers/middleware';

import { handlerConfig, ParamsInterface, ResultInterface } from '@shared/application/create.contract';
import { alias } from '@shared/application/create.schema';
import { ApplicationRepositoryProviderInterfaceResolver } from '../interfaces/ApplicationRepositoryProviderInterface';

@handler({
  ...handlerConfig,
  middlewares: [
    ['validate', alias],
    copyFromContextMiddleware('call.user.operator_id', 'owner_id'),
    hasPermissionByScopeMiddleware(undefined, ['operator.application.create', 'call.user.operator_id', 'owner_id']),
  ],
})
export class CreateApplicationAction extends AbstractAction {
  constructor(private applicationRepository: ApplicationRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    return this.applicationRepository.create({
      ...params,
      owner_service: 'operator',
      permissions: [],
    });
  }
}
