import { Action as AbstractAction } from '@ilos/core';
import { handler, ContextType } from '@ilos/common';

import {
  handlerConfig,
  ParamsInterface,
  ResultInterface,
  RepositoryInterface,
} from '../shared/application/revoke.contract';
import { alias } from '../shared/application/revoke.schema';
import { ApplicationRepositoryProviderInterfaceResolver } from '../interfaces/ApplicationRepositoryProviderInterface';
import { setOwner } from '../helpers/setOwner';

@handler(handlerConfig)
export class RevokeApplicationAction extends AbstractAction {
  public readonly middlewares: (string | [string, any])[] = [
    ['validate', alias],
    ['can', ['application.revoke']],
  ];

  constructor(private applicationRepository: ApplicationRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    const data = setOwner<RepositoryInterface>('operator', params, context);

    await this.applicationRepository.revoke(data);
  }
}
