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
  public readonly middlewares: (string | [string, any])[] = [
    ['validate', alias],
    ['can', ['application.find']],
  ];

  constructor(private applicationRepository: ApplicationRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    const data = setOwner<RepositoryInterface>('operator', params, context);

    // when the owner_id / operator_id is a string (old payloads)
    // we search by UUID only as the owner_id is now an integer
    return typeof params.owner_id === 'string'
      ? this.applicationRepository.findByUuid({ uuid: params.uuid })
      : this.applicationRepository.find(data);
  }
}
