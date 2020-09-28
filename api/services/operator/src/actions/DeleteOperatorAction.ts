import { handler, KernelInterfaceResolver } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';

import { OperatorRepositoryProviderInterfaceResolver } from '../interfaces/OperatorRepositoryProviderInterface';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/operator/delete.contract';
import { alias } from '../shared/operator/delete.schema';

@handler({
  ...handlerConfig,
  middlewares: [
    ['can', ['operator.delete']],
    ['validate', alias],
  ],
})
export class DeleteOperatorAction extends AbstractAction {
  constructor(
    private kernel: KernelInterfaceResolver,
    private operatorRepository: OperatorRepositoryProviderInterfaceResolver,
  ) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    await this.operatorRepository.delete(params._id);

    await this.kernel.call(
      'user:deleteAssociated',
      {
        operator_id: params._id,
      },
      {
        channel: { service: 'operator' },
      },
    );

    return true;
  }
}
