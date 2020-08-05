// Old API : TODO: remove after complete service migration

/*
import { Action as AbstractAction } from '@ilos/core';
import { handler } from '@ilos/common';

import { TerritoryRepositoryProviderInterfaceResolver } from '../interfaces/TerritoryRepositoryProviderInterface';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/territory/findByInsee.contract';
import { alias } from '../shared/territory/findByInsee.schema';
import { blacklist } from '../config/filterOutput';

@handler({
  ...handlerConfig,
  middlewares: [
    ['validate', alias],
    ['content.blacklist', blacklist],
  ],
})
export class FindTerritoryByInseeAction extends AbstractAction {
  constructor(private territoryRepository: TerritoryRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(data: ParamsInterface): Promise<ResultInterface> {
    return this.territoryRepository.findByInsee(data.insee);
  }
}
*/
