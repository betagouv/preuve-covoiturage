import { handler } from '/ilos/common/index.ts';
import { Action as AbstractAction } from '/ilos/core/index.ts';
import { hasPermissionMiddleware, contentBlacklistMiddleware } from '/pdc/providers/middleware/index.ts';

import { OperatorRepositoryProviderInterfaceResolver } from '../interfaces/OperatorRepositoryProviderInterface.ts';
import { handlerConfig, ParamsInterface, ResultInterface } from '/shared/operator/list.contract.ts';

@handler({
  ...handlerConfig,
  middlewares: [
    hasPermissionMiddleware('common.operator.list'),
    contentBlacklistMiddleware('data.*.contacts', 'data.*.bank'),
  ],
})
export class ListOperatorAction extends AbstractAction {
  constructor(private operatorRepository: OperatorRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(_params: ParamsInterface): Promise<ResultInterface> {
    return this.operatorRepository.all();
  }
}
