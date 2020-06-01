import { Action as AbstractAction } from '@ilos/core';
import { handler } from '@ilos/common';

import { TerritoryRepositoryProviderInterfaceResolver } from '../interfaces/TerritoryRepositoryProviderInterface';
import { handlerConfig, ParamsInterface } from '../shared/territory/update.contract';
import { alias } from '../shared/territory/update.schema';
import { TerritoryDbMetaInterface } from '../shared/territory/common/interfaces/TerritoryDbMetaInterface';

@handler({
  ...handlerConfig,
  middlewares: [
    ['can', ['territory.update']],
    ['validate', alias],
  ],
})
export class UpdateTerritoryAction extends AbstractAction {
  constructor(private territoryRepository: TerritoryRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<TerritoryDbMetaInterface> {
    // TODO : ResultInterface as repository return interface
    // throw new Error('to migrate with new Result Interface');
    return this.territoryRepository.update(params);
  }
}
