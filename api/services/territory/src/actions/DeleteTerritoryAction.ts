import { Parents, Container } from '@ilos/core';

import { TerritoryRepositoryProviderInterfaceResolver } from '../interfaces/TerritoryRepositoryProviderInterface';

@Container.handler({
  service: 'territory',
  method: 'delete',
})
export class DeleteTerritoryAction extends Parents.Action {
  constructor(private territoryRepository: TerritoryRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: { _id: string }): Promise<boolean> {
    await this.territoryRepository.delete(params);
    return true;
  }
}
