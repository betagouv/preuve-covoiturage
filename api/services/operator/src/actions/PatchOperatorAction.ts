import { handler } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';
import { PatchOperatorParamsInterface, OperatorInterface } from '@pdc/provider-schema';

import { OperatorRepositoryProviderInterfaceResolver } from '../interfaces/OperatorRepositoryProviderInterface';

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

  public async handle(params: { _id: string; patch: PatchOperatorParamsInterface }): Promise<OperatorInterface> {
    return this.operatorRepository.patch(params._id, params.patch);
  }
}
