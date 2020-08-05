import { Action as AbstractAction } from '@ilos/core';
import { handler } from '@ilos/common';

import { TerritoryRepositoryProviderInterfaceResolver } from '../interfaces/TerritoryRepositoryProviderInterface';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/territory/relationUiStatus.contract';
import { alias } from '../shared/territory/relationUiStatus.schema';

@handler({
  ...handlerConfig,
  middlewares: [
    ['can', ['territory.read']],
    ['validate', alias],
  ],
})
export class GetTerritoryRelationUIStatusAction extends AbstractAction {
  constructor(private territoryRepository: TerritoryRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    return this.territoryRepository.getRelationUiStatusDetails(params._id);
  }
}
