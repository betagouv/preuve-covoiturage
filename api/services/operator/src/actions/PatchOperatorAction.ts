import { handler } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';

import { OperatorRepositoryProviderInterfaceResolver } from '../interfaces/OperatorRepositoryProviderInterface';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared//operator/patch.contract';
import { alias } from '../shared/operator/patch.schema';

@handler({
  ...handlerConfig,
  middlewares: [
    ['can', ['operator.update']],
    ['validate', alias],
  ],
})
export class PatchOperatorAction extends AbstractAction {
  constructor(private operatorRepository: OperatorRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    return this.operatorRepository.patch(params._id, params.patch);
  }
}
