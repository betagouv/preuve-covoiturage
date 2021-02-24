import { Action as AbstractAction } from '@ilos/core';
import { handler } from '@ilos/common';
import { hasPermissionMiddleware } from '@pdc/provider-middleware';

import { TerritoryRepositoryProviderInterfaceResolver } from '../interfaces/TerritoryRepositoryProviderInterface';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/territory/find.contract';
import { alias } from '../shared/territory/find.schema';

/// TODO
@handler({
  ...handlerConfig,
  middlewares: [hasPermissionMiddleware('territory.find'), ['validate', alias]],
})
export class FindTerritoryAction extends AbstractAction {
  constructor(private territoryRepository: TerritoryRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    return this.territoryRepository.find(params.query, params.sort, params.projection);
  }
}
