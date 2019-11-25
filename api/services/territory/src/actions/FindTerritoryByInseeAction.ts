import { Action as AbstractAction } from '@ilos/core';
import { handler } from '@ilos/common';

import { TerritoryRepositoryProviderInterfaceResolver } from '../interfaces/TerritoryRepositoryProviderInterface';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/territory/findByInsee.contract';
import { ActionMiddleware } from '../shared/common/ActionMiddlewareInterface';
import { alias } from '../shared/territory/findByInsee.schema';
import { blacklist } from '../config/filterOutput';

@handler(handlerConfig)
export class FindTerritoryByInseeAction extends AbstractAction {
  public readonly middlewares: ActionMiddleware[] = [
    ['validate', alias],
    ['content.blacklist', blacklist],
  ];

  constructor(private territoryRepository: TerritoryRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(data: ParamsInterface): Promise<ResultInterface> {
    return this.territoryRepository.findByInsee(data.insee);
  }
}
