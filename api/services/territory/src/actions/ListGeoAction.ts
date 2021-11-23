import { ContextType, handler } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';
import { copyFromContextMiddleware, hasPermissionMiddleware } from '@pdc/provider-middleware';

import { TerritoryRepositoryProviderInterfaceResolver } from '../interfaces/TerritoryRepositoryProviderInterface';
import { handlerConfig, ResultInterface, ParamsInterface } from '../shared/territory/listGeo.contract';
import { alias } from '../shared/territory/listGeo.schema';

@handler({
  ...handlerConfig,
  middlewares: [
    hasPermissionMiddleware('common.territory.list'),
    // set the on_territories to own authorizedZoneCodes  when user is a territory
    copyFromContextMiddleware('call.user.authorizedZoneCodes._id', 'on_territories'),
    ['validate', alias],
  ],
})
export class ListGeoAction extends AbstractAction {
  constructor(private territoryRepository: TerritoryRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface[]> {
    return this.territoryRepository.dropdown(params);
  }
}
