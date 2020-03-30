import { Action as AbstractAction } from '@ilos/core';
import { handler, ContextType } from '@ilos/common';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/acquisition/logerror.contract';
import { alias } from '../shared/acquisition/logerror.schema';
import { ErrorRepositoryProviderInterfaceResolver } from '../interfaces/ErrorRepositoryProviderInterface';

@handler({
  ...handlerConfig,
  middlewares: [
    ['channel.service.only', ['acquisition']],
    ['validate', alias],
  ],
})
export class LogErrorAction extends AbstractAction {
  constructor(private repo: ErrorRepositoryProviderInterfaceResolver) {
    super();
  }

  protected async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    // clean up sensitive data
    delete params.headers.authorization;
    delete params.headers.cookie;
    return this.repo.log({ error_resolved: false, ...params });
  }
}
