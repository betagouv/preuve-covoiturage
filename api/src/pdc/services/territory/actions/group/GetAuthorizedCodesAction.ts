import { Action as AbstractAction } from '@ilos/core/index.ts';
import { handler } from '@ilos/common/index.ts';
import { hasPermissionMiddleware } from '@pdc/providers/middleware/index.ts';

import { TerritoryRepositoryProviderInterfaceResolver } from '../../interfaces/TerritoryRepositoryProviderInterface.ts';
import { handlerConfig, ParamsInterface, ResultInterface } from '@shared/territory/getAuthorizedCodes.contract.ts';
import { alias } from '@shared/territory/getAuthorizedCodes.schema.ts';

@handler({
  ...handlerConfig,
  middlewares: [hasPermissionMiddleware('common.territory.read'), ['validate', alias]],
})
export class GetAuthorizedCodesAction extends AbstractAction {
  constructor(private territoryRepository: TerritoryRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    return this.territoryRepository.getRelationCodesCom(params);
  }
}
