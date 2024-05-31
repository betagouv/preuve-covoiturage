import { Action as AbstractAction } from '@ilos/core/index.ts';
import { handler } from '@ilos/common/index.ts';
import { hasPermissionMiddleware } from '@pdc/providers/middleware/index.ts';

import { alias } from '@shared/honor/save.schema.ts';
import { handlerConfig, ResultInterface, ParamsInterface } from '@shared/honor/save.contract.ts';
import { HonorRepositoryInterfaceResolver } from '../providers/HonorRepositoryProvider.ts';

@handler({
  ...handlerConfig,
  middlewares: [['validate', alias], hasPermissionMiddleware('common.honor.save')],
})
export class SaveAction extends AbstractAction {
  constructor(private pg: HonorRepositoryInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    await this.pg.save(params.type, params.employer);
  }
}
