import { Action as AbstractAction } from '@ilos/core';
import { handler } from '@ilos/common';
import { PatchTerritoryParamsInterface, TerritoryInterface } from '@pdc/provider-schema';

import { TerritoryRepositoryProviderInterfaceResolver } from '../interfaces/TerritoryRepositoryProviderInterface';

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

  public async handle(params: { _id: string; patch: PatchTerritoryParamsInterface }): Promise<TerritoryInterface> {
    return this.territoryRepository.patch(params._id, params.patch);
  }
}
