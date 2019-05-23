import { Parents, Container } from '@pdc/core';
import { OperatorRepositoryProviderInterfaceResolver } from '../interfaces/OperatorRepositoryProviderInterface';
import { PatchOperatorParamsInterface, OperatorDbInterface } from '../interfaces/OperatorInterfaces';

@Container.handler({
  service: 'operator',
  method: 'patch',
})
export class PatchOperatorAction extends Parents.Action {
  constructor(
    private operatorRepository: OperatorRepositoryProviderInterfaceResolver,
  ) {
    super();
  }

  public async handle(params: { id: string, patch: PatchOperatorParamsInterface }): Promise<OperatorDbInterface> {
    return this.operatorRepository.patch(params.id, params.patch);
  }
}
