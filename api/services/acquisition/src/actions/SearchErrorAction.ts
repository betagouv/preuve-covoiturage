import { Action as AbstractAction } from '@ilos/core';
import { handler, ContextType } from '@ilos/common';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/acquisition/searcherrors.contract';
import { alias } from '../shared/acquisition/searcherrors.schema';
import { ErrorRepositoryProviderInterfaceResolver } from '../interfaces/ErrorRepositoryProviderInterface';

@handler({
  ...handlerConfig,
  middlewares: [
    ['channel.service.only', ['acquisition']],
    ['validate', alias],
  ],
})
export class SearchErrorAction extends AbstractAction {
  constructor(private repo: ErrorRepositoryProviderInterfaceResolver) {
    super();
  }

  protected async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    // clean up sensitive data

    return this.repo.search(params);
  }
}
