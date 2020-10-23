import { Action as AbstractAction } from '@ilos/core';
import { handler } from '@ilos/common';

import { alias } from '../shared/honor/save.schema';
import { handlerConfig, ResultInterface, ParamsInterface } from '../shared/honor/save.contract';
import { HonorRepositoryInterfaceResolver } from '../providers/HonorRepositoryProvider';

@handler({
  ...handlerConfig,
  middlewares: [
    ['validate', alias],
    ['channel.service.only', ['proxy']],
  ],
})
export class SaveAction extends AbstractAction {
  constructor(private pg: HonorRepositoryInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    await this.pg.save(params.type);
  }
}
