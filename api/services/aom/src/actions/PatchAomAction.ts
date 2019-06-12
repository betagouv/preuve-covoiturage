import { Parents, Container } from '@ilos/core';

import { AomRepositoryProviderInterfaceResolver } from '../interfaces/AomRepositoryProviderInterface';
import { PatchAomParamsInterface, AomDbInterface } from '../interfaces/AomInterfaces';

@Container.handler({
  service: 'aom',
  method: 'patch',
})
export class PatchAomAction extends Parents.Action {
  constructor(private aomRepository: AomRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: { id: string; patch: PatchAomParamsInterface }): Promise<AomDbInterface> {
    return this.aomRepository.patch(params.id, params.patch);
  }
}
