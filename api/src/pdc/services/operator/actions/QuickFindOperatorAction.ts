import { handler } from '@ilos/common/index.ts';
import { Action as AbstractAction } from '@ilos/core/index.ts';
import { hasPermissionMiddleware } from '@pdc/providers/middleware/index.ts';

import { OperatorRepositoryProviderInterfaceResolver } from '../interfaces/OperatorRepositoryProviderInterface.ts';
import { handlerConfig, ParamsInterface, ResultInterface } from '@shared/operator/quickfind.contract.ts';
import { alias } from '@shared/operator/quickfind.schema.ts';

@handler({
  ...handlerConfig,
  middlewares: [hasPermissionMiddleware('common.operator.find'), ['validate', alias]],
})
export class QuickFindOperatorAction extends AbstractAction {
  constructor(private operatorRepository: OperatorRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    return this.operatorRepository.quickFind(params._id, params.thumbnail || false);
  }
}
