import { handler } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';

import { OperatorRepositoryProviderInterfaceResolver } from '../interfaces/OperatorRepositoryProviderInterface';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/operator/quickfind.contract';
import { alias } from '../shared/operator/quickfind.schema';

@handler({
  ...handlerConfig,
  middlewares: [
    ['can', ['operator.read']],
    ['validate', alias],
  ],
})
export class QuickFindOperatorAction extends AbstractAction {
  constructor(private operatorRepository: OperatorRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    return this.operatorRepository.quickFind(params._id);
  }
}
