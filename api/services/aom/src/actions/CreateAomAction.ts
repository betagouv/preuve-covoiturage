import { Parents, Container } from '@ilos/core';

import { AomRepositoryProviderInterfaceResolver } from '../interfaces/AomRepositoryProviderInterface';
import { CreateAomParamsInterface, AomDbInterface } from '../interfaces/AomInterfaces';

@Container.handler({
  service: 'aom',
  method: 'create',
})
export class CreateAomAction extends Parents.Action {
  constructor(private aomRepository: AomRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: CreateAomParamsInterface): Promise<AomDbInterface> {
    return this.aomRepository.create(params);
  }
}
