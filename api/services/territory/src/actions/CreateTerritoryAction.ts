import { Action as AbstractAction } from '@ilos/core';
import { handler } from '@ilos/common';

import { TerritoryRepositoryProviderInterfaceResolver } from '../interfaces/TerritoryRepositoryProviderInterface';
import { CreateTerritoryParamsInterface, TerritoryDbInterface } from '../interfaces/TerritoryInterfaces';

@handler({
  service: 'territory',
  method: 'create',
})
export class CreateTerritoryAction extends AbstractAction {
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
