// Old API : TODO: remove after complete service migration
import { hasPermissionMiddleware, contentBlacklistMiddleware } from '@pdc/provider-middleware';
import { Action as AbstractAction } from '@ilos/core';
import { handler } from '@ilos/common';

import { TerritoryRepositoryProviderInterfaceResolver } from '../interfaces/TerritoryRepositoryProviderInterface';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/territory/findByInsees.contract';
import { alias } from '../shared/territory/findByInsees.schema';
import { blacklist } from '../config/filterOutput';

@handler({
  ...handlerConfig,
  middlewares: [
    hasPermissionMiddleware('common.territory.list'),
    ['validate', alias],
    contentBlacklistMiddleware(...blacklist),
  ],
})
export class FindTerritoryByInseesAction extends AbstractAction {
  constructor(private territoryRepository: TerritoryRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    return this.territoryRepository.findByInsees(params);
  }
}
