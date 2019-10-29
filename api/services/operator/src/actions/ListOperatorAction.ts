import { handler } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';

import { OperatorRepositoryProviderInterfaceResolver } from '../interfaces/OperatorRepositoryProviderInterface';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/operator/list.contract';
import { ActionMiddleware } from '../shared/common/ActionMiddlewareInterface';

@handler(handlerConfig)
export class ListOperatorAction extends AbstractAction {
  public readonly middlewares: ActionMiddleware[] = [
    ['can', ['operator.list']],
    ['content.blacklist', ['data.*.contacts', 'data.*.bank']],
  ];

  constructor(private operatorRepository: OperatorRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(_params: ParamsInterface): Promise<ResultInterface> {
    return this.operatorRepository.all();
  }
}
