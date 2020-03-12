import { handler } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';

import { OperatorRepositoryProviderInterfaceResolver } from '../interfaces/OperatorRepositoryProviderInterface';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/operator/create.contract';
import { alias } from '../shared/operator/create.schema';

@handler({
  ...handlerConfig,
  middlewares: [
    ['can', ['operator.create']],
    ['validate', alias],
  ],
})
export class CreateOperatorAction extends AbstractAction {
  constructor(private operatorRepository: OperatorRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    return this.operatorRepository.create(params);
  }
}
