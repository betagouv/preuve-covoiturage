import { handler } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';
import { CreateOperatorParamsInterface, OperatorInterface } from '@pdc/provider-schema';

import { OperatorRepositoryProviderInterfaceResolver } from '../interfaces/OperatorRepositoryProviderInterface';

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

  public async handle(params: CreateOperatorParamsInterface): Promise<OperatorInterface> {
    return this.operatorRepository.create(params);
  }
}
