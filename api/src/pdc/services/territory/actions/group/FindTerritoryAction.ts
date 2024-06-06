import { Action as AbstractAction } from '/ilos/core/index.ts';
import { handler } from '/ilos/common/index.ts';
import { hasPermissionMiddleware } from '/pdc/providers/middleware/index.ts';

import { TerritoryRepositoryProviderInterfaceResolver } from '../../interfaces/TerritoryRepositoryProviderInterface.ts';
import { handlerConfig, ParamsInterface, ResultInterface } from '/shared/territory/find.contract.ts';
import { alias } from '/shared/territory/find.schema.ts';

@handler({
  ...handlerConfig,
  middlewares: [hasPermissionMiddleware('common.territory.find'), ['validate', alias]],
})
export class FindTerritoryAction extends AbstractAction {
  constructor(private territoryRepository: TerritoryRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    return this.territoryRepository.find(params);
  }
}
