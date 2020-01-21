import { Action as AbstractAction } from '@ilos/core';
import { handler, ContextType } from '@ilos/common';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/acquisition/logerror.contract';
import { alias } from '../shared/acquisition/logerror.schema';
import { ActionMiddleware } from '../shared/common/ActionMiddlewareInterface';
import { ErrorRepositoryProviderInterfaceResolver } from '../interfaces/ErrorRepositoryProviderInterface';

@handler(handlerConfig)
export class LogErrorAction extends AbstractAction {
  public readonly middlewares: ActionMiddleware[] = [
    ['channel.service.only', ['acquisition']],
    ['validate', alias],
  ];

  constructor(private repo: ErrorRepositoryProviderInterfaceResolver) {
    super();
  }

  protected async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    // clean up sensitive data
    delete params.headers.authorization;
    delete params.headers.cookie;

    return this.repo.create(params);
  }
}
