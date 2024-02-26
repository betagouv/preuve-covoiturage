import { handler } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';
import { hasPermissionMiddleware } from '@pdc/provider-middleware';

import { OperatorRepositoryProviderInterfaceResolver } from '../interfaces/OperatorRepositoryProviderInterface';
import { handlerConfig, ParamsInterface, ResultInterface } from '@shared/operator/quickfind.contract';
import { alias } from '@shared/operator/quickfind.schema';

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
