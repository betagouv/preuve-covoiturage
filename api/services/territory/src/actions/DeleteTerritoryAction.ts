import { Action as AbstractAction } from '@ilos/core';
import { handler } from '@ilos/common';

import { TerritoryRepositoryProviderInterfaceResolver } from '../interfaces/TerritoryRepositoryProviderInterface';
import { configHandler, ParamsInterface, ResultInterface } from '../shared/territory/delete.contract';
import { ActionMiddleware } from '../shared/common/ActionMiddlewareInterface';
import { alias } from '../shared/territory/delete.schema';

@handler(configHandler)
export class DeleteTerritoryAction extends AbstractAction {
  public readonly middlewares: ActionMiddleware[] = [['can', ['territory.delete']], ['validate', alias]];

  constructor(private territoryRepository: TerritoryRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    await this.territoryRepository.delete(params._id);
    return true;
  }
}
