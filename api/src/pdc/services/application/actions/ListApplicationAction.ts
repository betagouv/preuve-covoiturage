import { Action as AbstractAction } from '@ilos/core/index.ts';
import { handler, ContextType } from '@ilos/common/index.ts';
import { copyFromContextMiddleware, hasPermissionByScopeMiddleware } from '@pdc/providers/middleware/index.ts';

import { handlerConfig, ParamsInterface, ResultInterface } from '@shared/application/list.contract.ts';
import { alias } from '@shared/application/list.schema.ts';
import { ApplicationRepositoryProviderInterfaceResolver } from '../interfaces/ApplicationRepositoryProviderInterface.ts';

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
