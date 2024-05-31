import { Action as AbstractAction } from '@ilos/core/index.ts';
import { handler } from '@ilos/common/index.ts';
import { hasPermissionMiddleware } from '@pdc/providers/middleware/index.ts';

import { alias } from '@shared/honor/stats.schema.ts';
import { handlerConfig, ResultInterface, ParamsInterface } from '@shared/honor/stats.contract.ts';
import { HonorRepositoryInterfaceResolver } from '../providers/HonorRepositoryProvider.ts';

@handler({
  ...handlerConfig,
  middlewares: [['validate', alias], hasPermissionMiddleware('common.honor.stats')],
})
export class StatsAction extends AbstractAction {
  constructor(private pg: HonorRepositoryInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    return this.pg.stats(params);
  }
}
