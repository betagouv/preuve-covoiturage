import { Action as AbstractAction } from '@ilos/core';
import { handler } from '@ilos/common';
import { hasPermissionMiddleware } from '@pdc/provider-middleware';

import { TerritoryRepositoryProviderInterfaceResolver } from '../interfaces/TerritoryRepositoryProviderInterface';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/territory/parentChildren.contract';
import { alias } from '../shared/territory/parentChildren.schema';

/// TODO
@handler({
  ...handlerConfig,
  middlewares: [hasPermissionMiddleware('territory.read'), ['validate', alias]],
})
export class GetTerritoryParentChildrenAction extends AbstractAction {
  constructor(private territoryRepository: TerritoryRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    return await this.territoryRepository.getDirectRelation(params._id || params._ids);
  }
}
