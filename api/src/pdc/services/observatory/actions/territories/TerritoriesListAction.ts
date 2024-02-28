import { Action as AbstractAction } from '@ilos/core';
import { handler } from '@ilos/common';
import { hasPermissionMiddleware } from '@pdc/providers/middleware';

import { alias } from '@shared/observatory/territories/list.schema';
import { handlerConfig, ResultInterface, ParamsInterface } from '@shared/observatory/territories/list.contract';
import { TerritoriesRepositoryInterfaceResolver } from '../../interfaces/TerritoriesRepositoryProviderInterface';
import { limitNumberParamWithinRange } from '../../helpers/checkParams';

@handler({
  ...handlerConfig,
  middlewares: [hasPermissionMiddleware('common.observatory.stats'), ['validate', alias]],
})
export class TerritoriesListAction extends AbstractAction {
  constructor(private repository: TerritoriesRepositoryInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    params.year = limitNumberParamWithinRange(params.year, 2020, new Date().getFullYear());
    return this.repository.getTerritoriesList(params);
  }
}
