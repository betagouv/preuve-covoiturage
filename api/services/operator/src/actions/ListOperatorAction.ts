import { handler } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';

import { OperatorRepositoryProviderInterfaceResolver } from '../interfaces/OperatorRepositoryProviderInterface';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/operator/list.contract';

@handler({
  ...handlerConfig,
  middlewares: [
    ['can', ['operator.list']],
    ['content.blacklist', ['data.*.contacts', 'data.*.bank']],
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
