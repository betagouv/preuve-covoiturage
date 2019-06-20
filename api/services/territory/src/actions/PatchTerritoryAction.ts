import { Parents, Container } from '@ilos/core';

import { TerritoryRepositoryProviderInterfaceResolver } from '../interfaces/TerritoryRepositoryProviderInterface';
import { PatchTerritoryParamsInterface, TerritoryDbInterface } from '../interfaces/TerritoryInterfaces';

@Container.handler({
  service: 'territory',
  method: 'patch',
})
export class PatchTerritoryAction extends Parents.Action {
  public readonly middlewares: (string | [string, any])[] = [
    ['can', ['territory.update']],
    ['validate', 'territory.patch'],
  ];

  constructor(private territoryRepository: TerritoryRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: { _id: string; patch: PatchTerritoryParamsInterface }): Promise<TerritoryDbInterface> {
    return this.territoryRepository.patch(params._id, params.patch);
  }
}
