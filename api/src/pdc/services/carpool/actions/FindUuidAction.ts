import { Action } from '@/ilos/core/index.ts';
import { handler } from '@/ilos/common/index.ts';
import { copyFromContextMiddleware, internalOnlyMiddlewares } from '@/pdc/providers/middleware/index.ts';

import { alias } from '@/shared/carpool/finduuid.schema.ts';
import { IdentityRepositoryProviderInterfaceResolver } from '../interfaces/IdentityRepositoryProviderInterface.ts';
import { handlerConfig, ParamsInterface, ResultInterface } from '@/shared/carpool/finduuid.contract.ts';

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
export class FindUuidAction extends Action {
  constructor(private repository: IdentityRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    const { identity, operator_id } = params;
    return this.repository.findUuid(identity, { operator_id });
  }
}
