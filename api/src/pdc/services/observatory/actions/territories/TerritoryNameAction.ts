import { Action as AbstractAction } from '@ilos/core/index.ts';
import { handler } from '@ilos/common/index.ts';
import { hasPermissionMiddleware } from '@pdc/providers/middleware/index.ts';

import { alias } from '@shared/observatory/territories/name.schema.ts';
import { handlerConfig, ResultInterface, ParamsInterface } from '@shared/observatory/territories/name.contract.ts';
import { TerritoriesRepositoryInterfaceResolver } from '../../interfaces/TerritoriesRepositoryProviderInterface.ts';
import { limitNumberParamWithinRange } from '../../helpers/checkParams.ts';

@handler({
  ...handlerConfig,
  middlewares: [hasPermissionMiddleware('common.observatory.stats'), ['validate', alias]],
})
export class TerritoryNameAction extends AbstractAction {
  constructor(private repository: TerritoriesRepositoryInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    params.year = limitNumberParamWithinRange(params.year, 2020, new Date().getFullYear());
    return this.repository.getTerritoryName(params);
  }
}
