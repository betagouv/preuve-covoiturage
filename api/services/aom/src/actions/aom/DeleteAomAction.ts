import { Parents, Container } from '@pdc/core';
import { AomRepositoryProviderInterfaceResolver } from '../../interfaces/AomRepositoryProviderInterface';
import { CreateAomParamsInterface, AomDbInterface } from '../../interfaces/AomInterfaces';

@Container.handler({
  service: 'organization',
  method: 'deleteAom',
})
export class DeleteAomAction extends Parents.Action {
  constructor(
    private aomRepository: AomRepositoryProviderInterfaceResolver,
  ) {
    super();
  }

  public async handle(params: { _id: string }): Promise<boolean> {
    await this.aomRepository.delete(params)
    return true;
  }
}
