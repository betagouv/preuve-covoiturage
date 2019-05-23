import { Parents, Container } from '@pdc/core';
import { OperatorRepositoryProviderInterfaceResolver } from '../interfaces/OperatorRepositoryProviderInterface';

@Container.handler({
  service: 'operator',
  method: 'delete',
})
export class DeleteOperatorAction extends Parents.Action {
  constructor(
    private operatorRepository: OperatorRepositoryProviderInterfaceResolver,
  ) {
    super();
  }

  public async handle(params: { _id: string }): Promise<boolean> {
    await this.operatorRepository.delete(params)
    return true;
  }
}
