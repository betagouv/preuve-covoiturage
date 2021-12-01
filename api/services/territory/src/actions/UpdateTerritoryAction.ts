import { handler } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';
import { hasPermissionByScopeMiddleware } from '@pdc/provider-middleware';
import { TerritoryRepositoryProviderInterfaceResolver } from '../interfaces/TerritoryRepositoryProviderInterface';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/territory/update.contract';
import { alias } from '../shared/territory/update.schema';

@handler({
  ...handlerConfig,
  middlewares: [
    hasPermissionByScopeMiddleware('registry.territory.update', [
      'territory.territory.update',
      'call.user.territory_id',
      'territory_id',
    ]),
    ['validate', alias],
  ],
})
export class UpdateTerritoryAction extends AbstractAction {
  constructor(private territoryRepository: TerritoryRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    return this.territoryRepository.update(params);
  }
}
