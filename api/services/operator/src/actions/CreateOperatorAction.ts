import { Parents, Container } from '@ilos/core';

import { OperatorRepositoryProviderInterfaceResolver } from '../interfaces/OperatorRepositoryProviderInterface';
import { CreateOperatorParamsInterface, OperatorDbInterface } from '../interfaces/OperatorInterfaces';

@Container.handler({
  service: 'operator',
  method: 'create',
})
export class CreateOperatorAction extends Parents.Action {
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
