import { Parents, Container } from '@ilos/core';

import { TerritoryRepositoryProviderInterfaceResolver } from '../interfaces/TerritoryRepositoryProviderInterface';
import { PatchTerritoryParamsInterface, TerritoryDbInterface } from '../interfaces/TerritoryInterfaces';

@Container.handler({
  service: 'territory',
  method: 'patch',
})
export class PatchTerritoryAction extends Parents.Action {
  constructor(private territoryRepository: TerritoryRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: { id: string; patch: PatchTerritoryParamsInterface }): Promise<TerritoryDbInterface> {
    return this.territoryRepository.patch(params.id, params.patch);
  }
}
