import { Action as AbstractAction } from '@ilos/core';
import { handler } from '@ilos/common';

import { TerritoryRepositoryProviderInterfaceResolver } from '../interfaces/TerritoryRepositoryProviderInterface';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/territory/findByPosition.contract';
import { alias } from '../shared/territory/findByPosition.schema';
import { blacklist } from '../config/filterOutput';

@handler({
  ...handlerConfig,
  middlewares: [
    ['validate', alias],
    ['content.blacklist', blacklist],
  ],
})
export class FindTerritoryByPositionAction extends AbstractAction {
  constructor(private territoryRepository: TerritoryRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    return this.territoryRepository.findByPosition(params.lon, params.lat);
  }
}
