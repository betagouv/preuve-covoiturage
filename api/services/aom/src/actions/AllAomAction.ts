import { Parents, Container } from '@pdc/core';
import { AomRepositoryProviderInterfaceResolver } from '../interfaces/AomRepositoryProviderInterface';

@Container.handler({
  service: 'aom',
  method: 'all',
})
export class AllAomAction extends Parents.Action {
  constructor(
    private aomRepository: AomRepositoryProviderInterfaceResolver,
  ) {
    super();
  }

  public async handle(): Promise<any[]> {
    return this.aomRepository.all();
  }
}
