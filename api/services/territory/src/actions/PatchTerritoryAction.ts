import { Action as AbstractAction } from '@ilos/core';
import { handler } from '@ilos/common';

import { TerritoryRepositoryProviderInterfaceResolver } from '../interfaces/TerritoryRepositoryProviderInterface';
import { PatchTerritoryParamsInterface, TerritoryDbInterface } from '../interfaces/TerritoryInterfaces';

@handler({
  service: 'territory',
  method: 'patch',
})
export class PatchTerritoryAction extends AbstractAction {
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
