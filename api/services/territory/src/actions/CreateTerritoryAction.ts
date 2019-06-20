import { Parents, Container } from '@ilos/core';

import { TerritoryRepositoryProviderInterfaceResolver } from '../interfaces/TerritoryRepositoryProviderInterface';
import { CreateTerritoryParamsInterface, TerritoryDbInterface } from '../interfaces/TerritoryInterfaces';

@Container.handler({
  service: 'territory',
  method: 'create',
})
export class CreateTerritoryAction extends Parents.Action {
  public readonly middlewares: (string | [string, any])[] = [
    ['can', ['territory.create']],
    ['validate', 'territory.create'],
  ];

  constructor(private territoryRepository: TerritoryRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: CreateTerritoryParamsInterface): Promise<TerritoryDbInterface> {
    return this.territoryRepository.create(params);
  }
}
