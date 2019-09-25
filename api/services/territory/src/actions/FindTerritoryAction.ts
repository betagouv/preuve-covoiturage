import { Action as AbstractAction } from '@ilos/core';
import { handler } from '@ilos/common';
import { PatchTerritoryParamsInterface, TerritoryInterface } from '@pdc/provider-schema';

import { TerritoryRepositoryProviderInterfaceResolver } from '../interfaces/TerritoryRepositoryProviderInterface';

@handler({
  service: 'territory',
  method: 'find',
})
export class FindTerritoryAction extends AbstractAction {
  public readonly middlewares: (string | [string, any])[] = [
    ['can', ['territory.read']],
    ['validate', 'territory.find'],
  ];

  constructor(private territoryRepository: TerritoryRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: { _id: string }): Promise<TerritoryInterface> {
    return this.territoryRepository.find(params._id);
  }
}
