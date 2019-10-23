import { Action as AbstractAction } from '@ilos/core';
import { handler } from '@ilos/common';

import { TerritoryRepositoryProviderInterfaceResolver } from '../interfaces/TerritoryRepositoryProviderInterface';
import { configHandler, ParamsInterface, ResultInterface } from '../shared/territory/find.contract';
import { ActionMiddleware } from '../shared/common/ActionMiddlewareInterface';
import { alias } from '../shared/territory/find.schema';

@handler(configHandler)
export class FindTerritoryAction extends AbstractAction {
  public readonly middlewares: ActionMiddleware[] = [['can', ['territory.read']], ['validate', alias]];

  constructor(private territoryRepository: TerritoryRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    return this.territoryRepository.find(params._id);
  }
}
