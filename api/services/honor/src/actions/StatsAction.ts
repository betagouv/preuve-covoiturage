import { Action as AbstractAction } from '@ilos/core';
import { handler } from '@ilos/common';

import { alias } from '../shared/honor/stats.schema';
import { handlerConfig, ResultInterface, ParamsInterface } from '../shared/honor/stats.contract';
import { HonorRepositoryInterfaceResolver } from '../providers/HonorRepositoryProvider';

@handler({
  ...handlerConfig,
  middlewares: [
    ['validate', alias],
    // ['channel.service.only', ['proxy']],
  ],
})
export class StatsAction extends AbstractAction {
  constructor(private pg: HonorRepositoryInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    return this.pg.stats(params);
  }
}
