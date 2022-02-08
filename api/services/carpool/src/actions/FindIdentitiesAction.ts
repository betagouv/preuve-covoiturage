import { Action } from '@ilos/core';
import { handler } from '@ilos/common';
import { copyFromContextMiddleware, internalOnlyMiddlewares } from '@pdc/provider-middleware';

import { alias } from '../shared/carpool/findidentities.schema';
import { IdentityRepositoryProviderInterfaceResolver } from '../interfaces/IdentityRepositoryProviderInterface';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/carpool/findidentities.contract';

/*
 * Dispatch carpool to other service when ready
 */
@handler({
  ...handlerConfig,
  middlewares: [
    ...internalOnlyMiddlewares('certificate'),
    copyFromContextMiddleware('call.user.operator_id', 'operator_id'),
    ['validate', alias],
  ],
})
export class FindIdentitiesAction extends Action {
  constructor(private repository: IdentityRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    const { identity, operator_id } = params;
    return this.repository.findIdentities(identity, { operator_id });
  }
}
