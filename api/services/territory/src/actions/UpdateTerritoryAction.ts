import { Action as AbstractAction } from '@ilos/core';
import { handler } from '@ilos/common';
import { UpdateTerritoryParamsInterface, TerritoryInterface } from '@pdc/provider-schema';

import { TerritoryRepositoryProviderInterfaceResolver } from '../interfaces/TerritoryRepositoryProviderInterface';

@handler({
  service: 'territory',
  method: 'update',
})
export class UpdateTerritoryAction extends AbstractAction {
  public readonly middlewares: (string | [string, any])[] = [
    ['can', ['territory.update']],
    ['validate', 'territory.update'],
  ];

  constructor(private territoryRepository: TerritoryRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: UpdateTerritoryParamsInterface): Promise<TerritoryInterface> {
    return this.territoryRepository.update(params);
  }
}
