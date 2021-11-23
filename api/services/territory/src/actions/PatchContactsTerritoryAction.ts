import { handler, ContextType } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';
import { copyFromContextMiddleware, hasPermissionByScopeMiddleware } from '@pdc/provider-middleware';

import { TerritoryRepositoryProviderInterfaceResolver } from '../interfaces/TerritoryRepositoryProviderInterface';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/territory/patchContacts.contract';
import { alias } from '../shared/territory/patchContacts.schema';

@handler({
  ...handlerConfig,
  middlewares: [
    copyFromContextMiddleware('call.user.territory_id', '_id'),
    hasPermissionByScopeMiddleware('registry.territory.patchContacts', [
      'territory.territory.patchContacts',
      'call.user.territory_id',
      '_id',
    ]),
    ['validate', alias],
  ],
})
export class PatchContactsTerritoryAction extends AbstractAction {
  constructor(private territoryRepository: TerritoryRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    return this.territoryRepository.patchContacts(params);
  }
}
