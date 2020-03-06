import { Action as AbstractAction } from '@ilos/core';
import { handler, ContextType } from '@ilos/common';

import {
  handlerConfig,
  ParamsInterface,
  ResultInterface,
  RepositoryInterface,
} from '../shared/application/list.contract';
import { alias } from '../shared/application/list.schema';
import { ApplicationRepositoryProviderInterfaceResolver } from '../interfaces/ApplicationRepositoryProviderInterface';
import { setOwner } from '../helpers/setOwner';

@handler({
  ...handlerConfig,
  middlewares: [
    ['validate', alias],
    ['can', ['application.list']],
  ],
})
export class ListApplicationAction extends AbstractAction {
  constructor(private applicationRepository: ApplicationRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    const data = setOwner<RepositoryInterface>('operator', params, context);

    return this.applicationRepository.list(data);
  }
}
