import { Action as AbstractAction } from '@ilos/core';
import { handler } from '@ilos/common';

import { TerritoryRepositoryProviderInterfaceResolver } from '../interfaces/TerritoryRepositoryProviderInterface';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/territory/create.contract';
import { alias } from '../shared/territory/create.schema';

@handler({
  ...handlerConfig,
  middlewares: [
    // ['can', ['territory.create']],
    ['validate', alias],
  ],
})
export class CreateTerritoryAction extends AbstractAction {
  constructor(private territoryRepository: TerritoryRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    // TODO : ResultInterface as repository return interface
    // throw new Error('to migrate with new Result Interface');
    // return this.territoryRepository.create(params);

    return this.territoryRepository.create(params);
  }
}
