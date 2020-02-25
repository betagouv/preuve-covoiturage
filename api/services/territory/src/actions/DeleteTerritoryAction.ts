import { Action as AbstractAction } from '@ilos/core';
import { handler } from '@ilos/common';

import { TerritoryRepositoryProviderInterfaceResolver } from '../interfaces/TerritoryRepositoryProviderInterface';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/territory/delete.contract';
import { alias } from '../shared/territory/delete.schema';

@handler({
  ...handlerConfig,
  middlewares: [
    ['can', ['territory.delete']],
    ['validate', alias],
  ],
})
export class DeleteTerritoryAction extends AbstractAction {
  constructor(private territoryRepository: TerritoryRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    await this.territoryRepository.delete(params._id);
  }
}
