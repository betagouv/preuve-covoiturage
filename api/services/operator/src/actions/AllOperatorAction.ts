import { Parents, Container } from '@ilos/core';

import { OperatorRepositoryProviderInterfaceResolver } from '../interfaces/OperatorRepositoryProviderInterface';

@Container.handler({
  service: 'operator',
  method: 'all',
})
export class AllOperatorAction extends Parents.Action {
  public readonly middlewares: (string | [string, any])[] = [['can', ['operator.list']]];

  constructor(private operatorRepository: OperatorRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(): Promise<any[]> {
    return this.operatorRepository.all();
  }
}
