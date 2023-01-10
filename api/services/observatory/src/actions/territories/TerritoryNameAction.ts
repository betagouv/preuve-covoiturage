import { Action as AbstractAction } from '@ilos/core';
import { handler } from '@ilos/common';
import { hasPermissionMiddleware } from '@pdc/provider-middleware';

import { alias } from '../../shared/observatory/territories/name.schema';
import { handlerConfig, ResultInterface, ParamsInterface } from '../../shared/observatory/territories/name.contract';
import { TerritoriesRepositoryInterfaceResolver } from '../../interfaces/TerritoriesRepositoryProviderInterface';

@handler({
  ...handlerConfig,
  middlewares: [
    hasPermissionMiddleware('common.observatory.stats'),
    ['validate', alias],
  ],
})
export class TerritoryNameAction extends AbstractAction {
  constructor(private repository: TerritoriesRepositoryInterfaceResolver) {
    super();
  }
  
  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    return this.repository.getTerritoryName(params);
  }
};