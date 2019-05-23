import { Parents, Container } from '@pdc/core';
import { OperatorRepositoryProviderInterfaceResolver } from '../interfaces/OperatorRepositoryProviderInterface';
import { CreateOperatorParamsInterface, OperatorDbInterface } from '../interfaces/OperatorInterfaces';

@Container.handler({
  service: 'operator',
  method: 'create',
})
export class CreateOperatorAction extends Parents.Action {
  constructor(
    private operatorRepository: OperatorRepositoryProviderInterfaceResolver,
  ) {
    super();
  }

  public async handle(params: CreateOperatorParamsInterface): Promise<OperatorDbInterface> {
    return this.operatorRepository.create(params);
  }
}
