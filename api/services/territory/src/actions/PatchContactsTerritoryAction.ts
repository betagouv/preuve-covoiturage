import { handler, ContextType } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';
import { PatchTerritoryParamsInterface, TerritoryInterface } from '@pdc/provider-schema';

import { TerritoryRepositoryProviderInterfaceResolver } from '../interfaces/TerritoryRepositoryProviderInterface';

@handler({
  service: 'territory',
  method: 'patchContacts',
})
export class PatchContactsTerritoryAction extends AbstractAction {
  public readonly middlewares: (string | [string, any])[] = [
    ['can', ['territory.contacts.update']],
    ['validate', 'territory.patchContacts'],
  ];

  constructor(private territoryRepository: TerritoryRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(
    params: { _id: string; patch: PatchTerritoryParamsInterface },
    context: ContextType,
  ): Promise<TerritoryInterface> {
    if (context.call.user.territory) {
      params._id = context.call.user.territory;
    }

    return this.territoryRepository.patch(params._id, {
      contacts: params.patch,
    });
  }
}
