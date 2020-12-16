import { get } from 'lodash';

import { Action } from '@ilos/core';
import { handler, ContextType } from '@ilos/common';

import { alias } from '../shared/carpool/finduuid.schema';
import { IdentityRepositoryProviderInterfaceResolver } from '../interfaces/IdentityRepositoryProviderInterface';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/carpool/finduuid.contract';

/*
 * Dispatch carpool to other service when ready
 */
@handler({
  ...handlerConfig,
  middlewares: [
    ['channel.service.only', ['certificate']],
    ['validate', alias],
  ],
})
export class FindUuidAction extends Action {
  constructor(private repository: IdentityRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    const operator_id = get(params, 'operator_id', get(context, 'call.user.operator_id', null));
    if (!operator_id) {
      throw new Error('operator_id must be defined when searching for an identity');
    }

    return this.repository.findUuid(params.identity, { operator_id });
  }
}
