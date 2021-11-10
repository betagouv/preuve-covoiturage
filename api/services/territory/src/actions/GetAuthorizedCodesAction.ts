import { Action as AbstractAction } from '@ilos/core';
import { handler } from '@ilos/common';
import { hasPermissionMiddleware } from '@pdc/provider-middleware';

import { TerritoryRepositoryProviderInterfaceResolver } from '../interfaces/TerritoryRepositoryProviderInterface';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/territory/getAuthorizedCodes.contract';
import { alias } from '../shared/territory/getAuthorizedCodes.schema';

@handler({
  ...handlerConfig,
  middlewares: [hasPermissionMiddleware('common.territory.read'), ['validate', alias]],
})
export class GetAuthorizedCodesAction extends AbstractAction {
  constructor(private territoryRepository: TerritoryRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    const result = await this.territoryRepository.getDirectRelation(params._id);
    return { _id: result.map((r) => r.descendant_ids).reduce((r, arr) => [...arr, ...r], []) };
  }
}
