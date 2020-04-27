import { Action as AbstractAction } from '@ilos/core';
import { handler } from '@ilos/common';

import { TerritoryRepositoryProviderInterfaceResolver } from '../interfaces/TerritoryRepositoryProviderInterface';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/territory/intermediaryRelation.contract';
import { alias } from '../shared/territory/intermediaryRelation.schema';

@handler({
  ...handlerConfig,
  middlewares: [
    ['can', ['territory.read']],
    ['validate', alias],
  ],
})
export class GetIntermediaryRelationAction extends AbstractAction {
  constructor(private territoryRepository: TerritoryRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    return this.territoryRepository.getIntermediateRelationData(params._id);
  }
}
