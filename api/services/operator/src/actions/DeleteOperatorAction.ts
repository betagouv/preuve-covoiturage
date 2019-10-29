import { handler } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';

import { OperatorRepositoryProviderInterfaceResolver } from '../interfaces/OperatorRepositoryProviderInterface';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/operator/delete.contract';
import { ActionMiddleware } from '../shared/common/ActionMiddlewareInterface';
import { alias } from '../shared/operator/delete.schema';

@handler(handlerConfig)
export class DeleteOperatorAction extends AbstractAction {
  public readonly middlewares: ActionMiddleware[] = [['can', ['operator.delete']], ['validate', alias]];

  constructor(private operatorRepository: OperatorRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    await this.operatorRepository.delete(params._id);
    return true;
  }
}
