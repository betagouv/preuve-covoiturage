import { handler, ContextType } from '@/ilos/common/index.ts';
import { Action as AbstractAction } from '@/ilos/core/index.ts';
import { copyFromContextMiddleware, hasPermissionByScopeMiddleware } from '@/pdc/providers/middleware/index.ts';

import { handlerConfig, ParamsInterface, ResultInterface } from '@/shared/application/find.contract.ts';
import { alias } from '@/shared/application/find.schema.ts';
import { ApplicationRepositoryProviderInterfaceResolver } from '../interfaces/ApplicationRepositoryProviderInterface.ts';

@handler({
  ...handlerConfig,
  middlewares: [
    ['validate', alias],
    copyFromContextMiddleware('call.user.operator_id', 'owner_id'),
    hasPermissionByScopeMiddleware('proxy.application.find', [
      'operator.application.find',
      'call.user.operator_id',
      'owner_id',
    ]),
  ],
})
export class FindApplicationAction extends AbstractAction {
  constructor(private applicationRepository: ApplicationRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    return this.applicationRepository.find({
      ...params,
      owner_service: 'operator',
    });
  }
}
