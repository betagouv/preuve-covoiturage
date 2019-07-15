import { Action as AbstractAction } from '@ilos/core';
import { handler } from '@ilos/common';

import { OperatorRepositoryProviderInterfaceResolver } from '../interfaces/OperatorRepositoryProviderInterface';
import { CreateOperatorParamsInterface, OperatorDbInterface } from '../interfaces/OperatorInterfaces';

@handler({
  service: 'operator',
  method: 'create',
})
export class CreateOperatorAction extends AbstractAction {
  public readonly middlewares: (string | [string, any])[] = [
    ['can', ['operator.create']],
    ['validate', 'operator.create'],
  ];

  constructor(private operatorRepository: OperatorRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: CreateOperatorParamsInterface): Promise<OperatorDbInterface> {
    return this.operatorRepository.create(params);
  }
}
