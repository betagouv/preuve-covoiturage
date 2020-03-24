import { handler } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';

import { OperatorRepositoryProviderInterfaceResolver } from '../interfaces/OperatorRepositoryProviderInterface';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/operator/find.contract';
import { alias } from '../shared/operator/find.schema';

@handler({
  ...handlerConfig,
  middlewares: [
    ['can', ['operator.read']],
    ['validate', alias],
  ],
})
export class FindOperatorAction extends AbstractAction {
  constructor(private operatorRepository: OperatorRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    return this.operatorRepository.find(params._id);
  }
}
