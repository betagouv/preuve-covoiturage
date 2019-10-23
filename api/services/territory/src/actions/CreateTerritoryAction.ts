import { Action as AbstractAction } from '@ilos/core';
import { handler } from '@ilos/common';

import { TerritoryRepositoryProviderInterfaceResolver } from '../interfaces/TerritoryRepositoryProviderInterface';
import { configHandler, ParamsInterface, ResultInterface } from '../shared/territory/create.contract';
import { ActionMiddleware } from '../shared/common/ActionMiddlewareInterface';
import { alias } from '../shared/territory/create.schema';

@handler(configHandler)
export class CreateTerritoryAction extends AbstractAction {
  public readonly middlewares: ActionMiddleware[] = [['can', ['territory.create']], ['validate', alias]];

  constructor(private territoryRepository: TerritoryRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    return this.territoryRepository.create(params);
  }
}
