import { Action as AbstractAction } from '@ilos/core';
import { handler } from '@ilos/common';

import { OperatorRepositoryProviderInterfaceResolver } from '../interfaces/OperatorRepositoryProviderInterface';
import { PatchOperatorParamsInterface, OperatorDbInterface } from '../interfaces/OperatorInterfaces';

@handler({
  service: 'operator',
  method: 'patch',
})
export class PatchOperatorAction extends AbstractAction {
  public readonly middlewares: (string | [string, any])[] = [
    ['can', ['operator.update']],
    ['validate', 'operator.patch'],
  ];

  constructor(private operatorRepository: OperatorRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: { _id: string; patch: PatchOperatorParamsInterface }): Promise<OperatorDbInterface> {
    return this.operatorRepository.patch(params._id, params.patch);
  }
}
