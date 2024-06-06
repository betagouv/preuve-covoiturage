import { handler } from '@/ilos/common/index.ts';
import { Action as AbstractAction } from '@/ilos/core/index.ts';
import { copyFromContextMiddleware, hasPermissionByScopeMiddleware } from '@/pdc/providers/middleware/index.ts';

import { TerritoryRepositoryProviderInterfaceResolver } from '../../interfaces/TerritoryRepositoryProviderInterface.ts';
import { handlerConfig, ParamsInterface, ResultInterface } from '@/shared/territory/patchContacts.contract.ts';
import { alias } from '@/shared/territory/patchContacts.schema.ts';

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
