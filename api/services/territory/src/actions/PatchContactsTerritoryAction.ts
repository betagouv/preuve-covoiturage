import { handler, ContextType } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';

import { TerritoryRepositoryProviderInterfaceResolver } from '../interfaces/TerritoryRepositoryProviderInterface';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/territory/patchContacts.contract';
import { alias } from '../shared/territory/patchContacts.schema';

@handler({
  ...handlerConfig,
  middlewares: [
    ['can', ['territory.contacts.update']],
    ['validate', alias],
  ],
})
export class PatchContactsTerritoryAction extends AbstractAction {
  constructor(private territoryRepository: TerritoryRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    if (context.call.user.territory_id) {
      params._id = context.call.user.territory_id;
    }

    return this.territoryRepository.patch(params._id, {
      contacts: params.patch,
    });
  }
}
