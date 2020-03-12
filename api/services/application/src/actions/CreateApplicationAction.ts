import { handler, ContextType } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';

import {
  handlerConfig,
  ParamsInterface,
  ResultInterface,
  RepositoryInterface,
} from '../shared/application/create.contract';
import { alias } from '../shared/application/create.schema';
import { ApplicationRepositoryProviderInterfaceResolver } from '../interfaces/ApplicationRepositoryProviderInterface';
import { setOwner } from '../helpers/setOwner';

@handler({
  ...handlerConfig,
  middlewares: [
    ['validate', alias],
    ['can', ['application.create']],
  ],
})
export class CreateApplicationAction extends AbstractAction {
  constructor(private applicationRepository: ApplicationRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    const data = setOwner<RepositoryInterface>('operator', params, context);

    data.permissions = data.permissions || ['journey.create', 'journey.status'];

    return this.applicationRepository.create(data);
  }
}
