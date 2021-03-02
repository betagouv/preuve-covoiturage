import { Action as AbstractAction } from '@ilos/core';
import { handler } from '@ilos/common';
import { hasPermissionMiddleware } from '@pdc/provider-middleware';

import { TerritoryRepositoryProviderInterfaceResolver } from '../interfaces/TerritoryRepositoryProviderInterface';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/territory/relationUiStatus.contract';
import { alias } from '../shared/territory/relationUiStatus.schema';

/// TODO
@handler({
  ...handlerConfig,
  middlewares: [hasPermissionMiddleware('common.territory.read'), ['validate', alias]],
})
export class GetTerritoryRelationUIStatusAction extends AbstractAction {
  constructor(private territoryRepository: TerritoryRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    return this.territoryRepository.getRelationUiStatusDetails(params._id);
  }
}
