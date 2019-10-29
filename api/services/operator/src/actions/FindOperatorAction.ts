import { handler } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';

import { OperatorRepositoryProviderInterfaceResolver } from '../interfaces/OperatorRepositoryProviderInterface';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/operator/find.contract';
import { ActionMiddleware } from '../shared/common/ActionMiddlewareInterface';
import { alias } from '../shared/operator/find.schema';

@handler(handlerConfig)
export class FindOperatorAction extends AbstractAction {
  public readonly middlewares: ActionMiddleware[] = [['can', ['operator.read']], ['validate', alias]];

  constructor(private operatorRepository: OperatorRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    return this.operatorRepository.find(params._id);
  }
}
