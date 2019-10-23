import { Action as AbstractAction } from '@ilos/core';
import { handler } from '@ilos/common';

import { TerritoryRepositoryProviderInterfaceResolver } from '../interfaces/TerritoryRepositoryProviderInterface';
import { configHandler, ParamsInterface, ResultInterface } from '../shared/territory/findByPosition.contract';
import { ActionMiddleware } from '../shared/common/ActionMiddlewareInterface';
import { alias } from '../shared/territory/findByPosition.schema';
import { blacklist } from '../config/filterOutput';

@handler(configHandler)
export class FindTerritoryByPositionAction extends AbstractAction {
  public readonly middlewares: ActionMiddleware[] = [['validate', alias], ['content.blacklist', blacklist]];

  constructor(private territoryRepository: TerritoryRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    return this.territoryRepository.findByPosition(params.lon, params.lat);
  }
}
