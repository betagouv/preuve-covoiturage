import { Action as AbstractAction } from '@ilos/core';
import { handler, ContextType } from '@ilos/common';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/acquisition/logrequest.contract';
// import { alias } from '../shared/acquisition/logerror.schema';
import { ErrorRepositoryProviderInterfaceResolver } from '../interfaces/ErrorRepositoryProviderInterface';

@handler({
  ...handlerConfig,
  middlewares: [
    // ['channel.service.only', ['proxy']],
    // ['can', ['acquisition.logrequest']],
    // ['validate', alias],
  ],
})
export class LogRequestAction extends AbstractAction {
  constructor(private repo: ErrorRepositoryProviderInterfaceResolver) {
    super();
  }

  protected async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    // clean up sensitive data
    delete params.headers.cookie;

    await this.repo.create(params);
  }
}
