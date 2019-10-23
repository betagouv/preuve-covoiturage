import { Action as AbstractAction } from '@ilos/core';
import { handler } from '@ilos/common';

import { TerritoryRepositoryProviderInterfaceResolver } from '../interfaces/TerritoryRepositoryProviderInterface';
import { configHandler, ParamsInterface, ResultInterface } from '../shared/territory/update.contract';
import { ActionMiddleware } from '../shared/common/ActionMiddlewareInterface';
import { alias } from '../shared/territory/update.schema';

@handler(configHandler)
export class UpdateTerritoryAction extends AbstractAction {
  public readonly middlewares: ActionMiddleware[] = [['can', ['territory.update']], ['validate', alias]];

  constructor(private territoryRepository: TerritoryRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    return this.territoryRepository.update(params);
  }
}
