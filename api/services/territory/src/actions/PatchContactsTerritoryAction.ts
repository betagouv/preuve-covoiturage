import { handler, ContextType } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';

import { TerritoryRepositoryProviderInterfaceResolver } from '../interfaces/TerritoryRepositoryProviderInterface';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/territory/patchContacts.contract';
import { ActionMiddleware } from '../shared/common/ActionMiddlewareInterface';
import { alias } from '../shared/territory/patchContacts.schema';

@handler(handlerConfig)
export class PatchContactsTerritoryAction extends AbstractAction {
  public readonly middlewares: ActionMiddleware[] = [
    ['can', ['territory.contacts.update']],
    ['validate', alias],
  ];

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
