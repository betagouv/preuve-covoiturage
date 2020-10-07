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
    // set the on_territories to own authorizedTerritories when user is a territory
    params.on_territories = get(context, 'call.user.authorizedTerritories', []);

    return this.territoryRepository.dropdown(params);
  }
}
