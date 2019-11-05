import { handler, ContextType } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';

import {
  handlerConfig,
  ParamsInterface,
  ResultInterface,
  RepositoryInterface,
} from '../shared/application/find.contract';
import { alias } from '../shared/application/find.schema';
import { ApplicationRepositoryProviderInterfaceResolver } from '../interfaces/ApplicationRepositoryProviderInterface';
import { setOwner } from '../helpers/setOwner';

@handler(handlerConfig)
export class FindApplicationAction extends AbstractAction {
  public readonly middlewares: (string | [string, any])[] = [['validate', alias], ['can', ['application.find']]];

  constructor(private applicationRepository: ApplicationRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    const data = setOwner<RepositoryInterface>('operator', params, context);

    return this.applicationRepository.find(data);
  }
}
