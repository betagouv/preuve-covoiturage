import { handler } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';
import { PatchOperatorParamsInterface, OperatorInterface } from '@pdc/provider-schema';

import { OperatorRepositoryProviderInterfaceResolver } from '../interfaces/OperatorRepositoryProviderInterface';

@handler({
  service: 'operator',
  method: 'find',
})
export class FindOperatorAction extends AbstractAction {
  public readonly middlewares: (string | [string, any])[] = [['can', ['operator.read']], ['validate', 'operator.find']];

  constructor(private operatorRepository: OperatorRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: { _id: string }): Promise<OperatorInterface> {
    return this.operatorRepository.find(params._id);
  }
}
