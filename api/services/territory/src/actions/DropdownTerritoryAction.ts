import { get } from 'lodash';
import { ContextType, handler } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';

import { TerritoryRepositoryProviderInterfaceResolver } from '../interfaces/TerritoryRepositoryProviderInterface';
import { handlerConfig, ResultInterface, ParamsInterface } from '../shared/territory/dropdown.contract';

@handler({
  ...handlerConfig,
  middlewares: [
    ['validate', 'territory.dropdown'],
    ['can', ['territory.list']],
  ],
})
export class DropdownTerritoryAction extends AbstractAction {
  constructor(private territoryRepository: TerritoryRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface[]> {
    // set the parent_id to own territory_id if exists
    const parent_id = get(context, 'call.user.territory_id', null);
    if (parent_id) {
      params.parent_id = parent_id;
    }

    return this.territoryRepository.dropdown(params);
  }
}
