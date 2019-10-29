import { Action as AbstractAction } from '@ilos/core';
import { handler } from '@ilos/common';
import { CreateTerritoryParamsInterface, TerritoryInterface } from '@pdc/provider-schema';

import { TerritoryRepositoryProviderInterfaceResolver } from '../interfaces/TerritoryRepositoryProviderInterface';

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

  public async handle(params: CreateTerritoryParamsInterface): Promise<TerritoryInterface> {
    return this.territoryRepository.create(params);
  }
}
