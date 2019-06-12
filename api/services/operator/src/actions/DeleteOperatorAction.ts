import { Parents, Container } from '@ilos/core';

import { OperatorRepositoryProviderInterfaceResolver } from '../interfaces/OperatorRepositoryProviderInterface';

@Container.handler({
  service: 'operator',
  method: 'delete',
})
export class DeleteOperatorAction extends Parents.Action {
  public readonly middlewares: (string | [string, any])[] = [
    ['can', ['operator.delete']],
    ['validate', 'operator.delete'],
  ];

  constructor(private operatorRepository: OperatorRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: { id: string }): Promise<boolean> {
    await this.operatorRepository.delete(params.id);
    return true;
  }
}
