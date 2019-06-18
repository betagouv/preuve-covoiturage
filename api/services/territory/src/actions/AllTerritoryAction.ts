import { Parents, Container } from '@ilos/core';

import { TerritoryRepositoryProviderInterfaceResolver } from '../interfaces/TerritoryRepositoryProviderInterface';

@Container.handler({
  service: 'territory',
  method: 'all',
})
export class AllTerritoryAction extends Parents.Action {
  constructor(private territoryRepository: TerritoryRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(): Promise<any[]> {
    return this.territoryRepository.all();
  }
}
